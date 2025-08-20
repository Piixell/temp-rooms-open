require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');

// Configurazione letta dalle variabili d'ambiente
let serverSettings = {
  generator_channel_id: process.env.GENERATOR_CHANNEL_ID || null,
  category_id: process.env.CATEGORY_ID || null,
  control_channel_id: process.env.CONTROL_CHANNEL_ID || null,
  channel_name_template: process.env.CHANNEL_NAME_TEMPLATE || '🔊 Stanza di {username}',
  default_user_limit: parseInt(process.env.DEFAULT_USER_LIMIT) || 0,
  max_channels: parseInt(process.env.MAX_CHANNELS) || 10
};

// Contatore per i nomi dei canali progressivi (per ogni server)
let guildChannelCounters = {};

// Simulazione di canali temporanei in memoria
let temporaryChannels = {};

// Funzione per ottenere il prossimo numero disponibile per il nome del canale
function getNextChannelNumber(guildId) {
  if (!guildChannelCounters[guildId]) {
    guildChannelCounters[guildId] = 1;
  }
  
  const nextNumber = guildChannelCounters[guildId];
  guildChannelCounters[guildId]++;
  
  return nextNumber;
}

// Funzione per generare il nome del canale
function generateChannelName(template, member, guildId) {
  if (template.includes('{username}')) {
    return template.replace('{username}', member.user.username);
  }
  
  if (template.includes('#')) {
    const nextNumber = getNextChannelNumber(guildId);
    return template.replace('#', `${nextNumber}`);
  }
  
  // Fallback
  return template.replace('{username}', member.user.username);
}

const { checkPremiumFeature } = require('./middleware/subscriptionMiddleware');
const { handleConfigCommand } = require('./commands/handlers/configHandler');
const { handleSubscribeCommand } = require('./commands/handlers/subscribeHandler');
const { handleSetupCommand } = require('./commands/handlers/setupHandler');
const { handleLimitCommand } = require('./commands/handlers/limitHandler');

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
});

// Gestisci le interazioni (comandi slash)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  
  try {
    switch (interaction.commandName) {
      case 'config':
        await handleConfigCommand(interaction);
        break;
      case 'subscribe':
        await handleSubscribeCommand(interaction);
        break;
      case 'setup':
        await handleSetupCommand(interaction);
        break;
      case 'limit':
        await handleLimitCommand(interaction);
        break;
      default:
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
});

// Listen for voice state updates
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const member = newState.member;
  const guild = newState.guild;
  const guildId = guild.id;
  
  // Ottieni le impostazioni dalle variabili d'ambiente
  const settings = serverSettings;
  
  // Se non ci sono impostazioni valide, non facciamo nulla
  if (!settings.generator_channel_id || !settings.category_id) {
    return;
  }
  
  // Check if user joined the generator channel
  if (!oldState.channelId && newState.channelId === settings.generator_channel_id) {
    // Verifica che la configurazione sia corretta
    if (!settings.category_id || !/^\d+$/.test(settings.category_id)) {
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
      // Genera il nome del canale usando il sistema progressivo
      const channelName = generateChannelName(settings.channel_name_template, member, guildId);
      
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
      
      // Aggiungi il canale alla memoria
      temporaryChannels[newChannel.id] = {
        channel_id: newChannel.id,
        guild_id: guildId,
        owner_id: member.user.id,
        user_limit: settings.default_user_limit || 0,
        created_at: new Date(),
        name: channelName // Aggiungi il nome per tener traccia dei numeri
      };

      
      // Move the user to the new channel
      await member.voice.setChannel(newChannel);
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
  
  // Check if user left a temporary channel
  if (oldState.channelId && !newState.channelId) {
    const channelId = oldState.channelId;
    
    // Verifica se il canale è un canale temporaneo
    if (temporaryChannels[channelId]) {
      // Verifica se il canale è ora vuoto
      const channel = oldState.guild.channels.cache.get(channelId);
      if (channel && channel.members.size === 0) {
        try {
          await channel.delete();
          
          // Rimuovi il canale dalla memoria
          delete temporaryChannels[channelId];
        } catch (error) {
          console.error('Error deleting temporary channel:', error);
        }
      }
    }
  }
  
  // Check if user moved from a temporary channel to another channel
  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    const oldChannelId = oldState.channelId;
    
    // Verifica se il canale è un canale temporaneo
    if (temporaryChannels[oldChannelId]) {
      // Verifica se il vecchio canale è ora vuoto
      const oldChannel = oldState.guild.channels.cache.get(oldChannelId);
      if (oldChannel && oldChannel.members.size === 0) {
        try {
          await oldChannel.delete();
          
          // Rimuovi il canale dalla memoria
          delete temporaryChannels[oldChannelId];
        } catch (error) {
          console.error('Error deleting temporary channel:', error);
        }
      }
    }
  }
});

// Login to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);
