require('dotenv').config();
const { Client, Events, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const express = require('express');
const session = require('express-session');
const { engine } = require('express-handlebars');
const path = require('path');
const expressHandlebars = require('express-handlebars');

const { initializeDatabase, getGuildSettings, setGuildSettings, addTemporaryChannel, removeTemporaryChannel, getTemporaryChannel } = require('./database/db');
const { checkPremiumFeature } = require('./middleware/subscriptionMiddleware');
const { handleConfigCommand } = require('./commands/handlers/configHandler');
const { handleSubscribeCommand } = require('./commands/handlers/subscribeHandler');
const { handleSetupCommand } = require('./commands/handlers/setupHandler');
const { handleLimitCommand } = require('./commands/handlers/limitHandler');

// Inizializza il database
initializeDatabase().then(() => {
  console.log('Database inizializzato con successo');
}).catch(err => {
  console.error('Errore nell\'inizializzazione del database:', err);
});

// Create a new client instance
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ] 
});

// Quando il client è pronto
client.once(Events.ClientReady, async c => {
  console.log(`TempRooms è online! Logged in as ${c.user.tag}`);
  
  // Invia un messaggio di benvenuto nei nuovi server
  client.guilds.cache.forEach(async guild => {
    await sendWelcomeMessage(guild);
  });
});

// Invia un messaggio di benvenuto quando il bot entra in un nuovo server
client.on(Events.GuildCreate, async guild => {
  console.log(`Bot aggiunto al server: ${guild.name} (${guild.id})`);
  await sendWelcomeMessage(guild);
});

// Invia un messaggio di benvenuto al server
async function sendWelcomeMessage(guild) {
  try {
    // Cerca un canale di sistema o un canale di testo generale
    let channel = guild.systemChannel;
    
    if (!channel) {
      // Se non c'è un canale di sistema, cerca un canale di testo generale
      channel = guild.channels.cache.find(c => 
        c.type === 0 && // Text channel
        (c.name.includes('general') || c.name.includes('generale'))
      );
    }
    
    if (!channel) {
      // Se ancora non abbiamo un canale, prendiamo il primo canale di testo
      channel = guild.channels.cache.find(c => c.type === 0);
    }
    
    if (channel) {
      const welcomeMessage = `
🎉 **Grazie per aver aggiunto TempRooms al tuo server!**

Configura il bot con i seguenti passaggi:

1. Crea un canale vocale "generatore"
2. Crea una categoria per i canali temporanei
3. Usa \`/setup\` per una guida dettagliata
4. Usa \`/config\` per configurare il bot

Per qualsiasi domanda, usa \`/subscribe\` per informazioni sui piani a pagamento.

Buona esperienza con TempRooms! 🚀
      `.trim();
      
      await channel.send(welcomeMessage);
    }
  } catch (error) {
    console.log(`Impossibile inviare il messaggio di benvenuto al server ${guild.name}:`, error);
  }
}

// Configura Express per la dashboard
const app = express();

// Configura handlebars
app.engine('handlebars', engine({
  helpers: {
    eq: function(a, b) {
      return a === b;
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'temp-rooms-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Rotte per la dashboard
app.get('/', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    isActiveDashboard: true,
    serverCount: client.guilds.cache.size,
    totalChannels: 0, // Questo andrebbe calcolato
    totalUsers: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
    lastUpdate: new Date().toLocaleString('it-IT')
  });
});

app.get('/servers', async (req, res) => {
  const guilds = client.guilds.cache.map(guild => ({
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount
  }));
  
  res.render('servers', {
    title: 'Server',
    isActiveServers: true,
    servers: guilds,
    clientId: process.env.CLIENT_ID
  });
});

app.get('/servers/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  const guild = client.guilds.cache.get(guildId);
  
  if (!guild) {
    return res.status(404).render('servers', {
      title: 'Server',
      isActiveServers: true,
      error: 'Server non trovato'
    });
  }
  
  // Ottieni la configurazione dal database
  const config = await getGuildSettings(guildId) || {
    generator_channel_id: null,
    category_id: null,
    control_channel_id: null,
    channel_name_template: '🔊 Stanza di {username}',
    default_user_limit: 0
  };
  
  // Verifica se la configurazione è completa
  const configComplete = !!(config.generator_channel_id && config.category_id);
  
  // Ottieni i canali del server
  const channels = guild.channels.cache.map(channel => ({
    id: channel.id,
    name: channel.name,
    type: channel.type === 2 ? 'voice' : channel.type === 0 ? 'text' : channel.type === 4 ? 'category' : 'other'
  }));
  
  const guilds = client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    memberCount: g.memberCount
  }));
  
  res.render('servers', {
    title: 'Server - ' + guild.name,
    isActiveServers: true,
    servers: guilds,
    selectedServer: {
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      voiceChannelCount: guild.channels.cache.filter(c => c.type === 2).size,
      textChannelCount: guild.channels.cache.filter(c => c.type === 0).size,
      activeTempChannels: 0, // Questo andrebbe calcolato
      config: config,
      configComplete: configComplete,
      channels: channels
    },
    clientId: process.env.CLIENT_ID
  });
});

// API endpoints per la configurazione
app.post('/api/servers/:guildId/config', async (req, res) => {
  const guildId = req.params.guildId;
  const guild = client.guilds.cache.get(guildId);
  
  if (!guild) {
    return res.json({ success: false, error: 'Server non trovato' });
  }
  
  try {
    // Aggiorna la configurazione nel database
    await setGuildSettings(guildId, {
      generator_channel_id: req.body.generator_channel_id || null,
      category_id: req.body.category_id || null,
      control_channel_id: req.body.control_channel_id || null,
      channel_name_template: req.body.channel_name_template || '🔊 Stanza di {username}',
      default_user_limit: parseInt(req.body.default_user_limit) || 0,
      max_channels: 10 // Valore di default
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Errore nel salvataggio della configurazione:', error);
    res.json({ success: false, error: 'Errore nel salvataggio della configurazione' });
  }
});

app.post('/api/servers/:guildId/reset', async (req, res) => {
  const guildId = req.params.guildId;
  
  try {
    // Resetta la configurazione nel database
    await setGuildSettings(guildId, {
      generator_channel_id: null,
      category_id: null,
      control_channel_id: null,
      channel_name_template: '🔊 Stanza di {username}',
      default_user_limit: 0,
      max_channels: 10
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Errore nel reset della configurazione:', error);
    res.json({ success: false, error: 'Errore nel reset della configurazione' });
  }
});

// Gestisci le interazioni (comandi slash)
client.on(Events.InteractionCreate, async interaction => {
  console.log('=== INTERACTION RECEIVED ===');
  console.log('Interaction type:', interaction.type);
  console.log('Interaction ID:', interaction.id);
  console.log('Guild ID:', interaction.guildId);
  console.log('Channel ID:', interaction.channelId);
  console.log('User:', interaction.user.tag);
  
  if (interaction.isChatInputCommand()) {
    console.log('Command name:', interaction.commandName);
    console.log('Command options:', interaction.options);
    
    try {
      switch (interaction.commandName) {
        case 'config':
          console.log('Handling config command');
          await handleConfigCommand(interaction);
          break;
        case 'subscribe':
          console.log('Handling subscribe command');
          await handleSubscribeCommand(interaction);
          break;
        case 'setup':
          console.log('Handling setup command');
          await handleSetupCommand(interaction);
          break;
        case 'limit':
          console.log('Handling limit command');
          await handleLimitCommand(interaction);
          break;
        default:
          console.log('Unknown command:', interaction.commandName);
          await interaction.reply({
            content: '❌ Comando non riconosciuto.',
            ephemeral: true
          });
      }
    } catch (error) {
      console.error('Error handling command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Si è verificato un errore durante l\'esecuzione del comando.',
          ephemeral: true
        });
      }
    }
  } else {
    console.log('Received non-chat input interaction');
  }
  
  console.log('=== END INTERACTION ===');
});

// Listen for voice state updates
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const member = newState.member;
  const guild = newState.guild;
  const guildId = guild.id;
  
  // Ottieni le impostazioni del server
  const settings = await getGuildSettings(guildId);
  
  // Se non ci sono impostazioni, non facciamo nulla
  if (!settings) {
    return;
  }
  
  // Check if user joined the generator channel
  if (!oldState.channelId && newState.channelId === settings.generator_channel_id) {
    console.log(`User ${member.user.tag} joined generator channel in guild ${guild.name}`);
    
    // Verifica che la configurazione sia corretta
    if (!settings.category_id || !/^\d+$/.test(settings.category_id)) {
      console.log(`Configurazione non valida per il server ${guild.name}: category_id=${settings.category_id}`);
      try {
        await member.send('❌ Configurazione non valida. L\'amministratore del server deve configurare correttamente il bot usando `/config set category` con un ID categoria valido.');
      } catch (err) {
        // Se non possiamo inviare un DM, non facciamo nulla
      }
      // Sposta l'utente fuori dal canale generatore
      try {
        await member.voice.setChannel(null);
      } catch (err) {
        console.log('Impossibile spostare l\'utente:', err);
      }
      return;
    }
    
    // Verifica i limiti del piano
    const planCheck = await checkPremiumFeature(guildId, 'unlimited_channels');
    if (!planCheck.allowed) {
      // Controlla quanti canali temporanei esistono già
      // (Lasciamo questa parte come era)
    }
    
    // Create a new temporary channel
    try {
      const channelName = settings.channel_name_template
        .replace('{username}', member.user.username)
        .replace('{discriminator}', member.user.discriminator)
        .replace('{userid}', member.user.id);
      
      const newChannel = await guild.channels.create({
        name: channelName,
        type: 2, // Voice channel
        parent: settings.category_id,
        userLimit: settings.default_user_limit || 0, // Imposta il limite utenti predefinito
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            allow: ['ViewChannel', 'Connect', 'Speak'],
          },
        ],
      });
      
      // Aggiungi il canale al database
      await addTemporaryChannel(
        newChannel.id, 
        guildId, 
        member.user.id, 
        settings.default_user_limit || 0
      );
      
      // Move the user to the new channel
      await member.voice.setChannel(newChannel);
      console.log(`Created temporary channel ${newChannel.name} for ${member.user.tag} in guild ${guild.name}`);
      
      // Invia un messaggio nel canale di controllo se configurato
      if (settings.control_channel_id) {
        try {
          const controlChannel = guild.channels.cache.get(settings.control_channel_id);
          if (controlChannel) {
            await controlChannel.send({
              content: `🔊 **Nuovo canale creato**\n` +
                      `Canale: ${newChannel.name} (<#${newChannel.id}>)\n` +
                      `Creato da: ${member.user.tag}\n` +
                      `Comando: Usa \`/limit numero\` mentre sei nel canale per impostare un limite di utenti`
            });
          }
        } catch (err) {
          console.log('Impossibile inviare messaggio nel canale di controllo:', err);
        }
      }
    } catch (error) {
      console.error('Error creating temporary channel:', error);
      try {
        if (error.code === 50035) {
          // Errore di validazione del form
          await member.send('❌ Configurazione non valida. L\'amministratore del server deve configurare correttamente il bot usando `/config set` con ID validi.');
        } else {
          await member.send('❌ Si è verificato un errore durante la creazione del canale temporaneo. Contatta un amministratore.');
        }
      } catch (err) {
        // Se non possiamo inviare un DM, non facciamo nulla
      }
      // Sposta l'utente fuori dal canale generatore in caso di errore
      try {
        await member.voice.setChannel(null);
      } catch (err) {
        console.log('Impossibile spostare l\'utente:', err);
      }
    }
  }
  
  // Check if a user left a channel
  if (oldState.channelId && !newState.channelId) {
    const channelId = oldState.channelId;
    const guildId = guild.id;
    
    // Verifica se il canale che è stato lasciato è uno dei nostri canali temporanei
    const tempChannel = await getTemporaryChannel(channelId);
    if (tempChannel) {
      // Get the channel object
      const channel = guild.channels.cache.get(channelId);
      
      // If the channel exists and is empty, delete it
      if (channel && channel.members.size === 0) {
        try {
          await channel.delete();
          await removeTemporaryChannel(channelId);
          console.log(`Deleted empty temporary channel with ID: ${channelId} in guild ${guild.name}`);
        } catch (error) {
          console.error('Error deleting temporary channel:', error);
        }
      }
    }
  }
  
  // Controlla se un utente si è spostato da un canale temporaneo a un altro
  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    const oldChannelId = oldState.channelId;
    const guildId = guild.id;
    
    // Verifica se il vecchio canale è uno dei nostri canali temporanei
    const tempChannel = await getTemporaryChannel(oldChannelId);
    if (tempChannel) {
      // Get the old channel object
      const oldChannel = guild.channels.cache.get(oldChannelId);
      
      // If the old channel exists and is now empty, delete it
      if (oldChannel && oldChannel.members.size === 0) {
        try {
          await oldChannel.delete();
          await removeTemporaryChannel(oldChannelId);
          console.log(`Deleted empty temporary channel with ID: ${oldChannelId} in guild ${guild.name}`);
        } catch (error) {
          console.error('Error deleting temporary channel:', error);
        }
      }
    }
  }
});

// Avvia il server web per la dashboard e i webhook
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server dashboard in ascolto sulla porta ${PORT}`);
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
