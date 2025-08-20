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

// Funzione per ottenere le impostazioni (simulazione)
function getGuildSettings() {
  return serverSettings;
}

// Funzione per impostare le impostazioni (simulazione)
function setGuildSettings(guildId, settings) {
  serverSettings = { ...serverSettings, ...settings };
  // In un'implementazione reale, qui andrebbe salvato su file .env
  return serverSettings;
}

async function handleConfigCommand(interaction) {
  // Verifica che l'utente abbia permessi di amministrazione
  if (!interaction.member.permissions.has('Administrator')) {
    return await interaction.reply({
      content: '❌ Solo gli amministratori possono configurare il bot!',
      ephemeral: true
    });
  }

  const subcommand = interaction.options.getSubcommand();
  
  switch (subcommand) {
    case 'view':
      const config = getGuildSettings();
      
      const viewEmbed = {
        color: 0x0099ff,
        title: '🔧 Configurazione Attuale',
        fields: [
          {
            name: 'Canale Generatore',
            value: config.generator_channel_id ? `<#${config.generator_channel_id}>` : '❌ Non impostato',
            inline: true
          },
          {
            name: 'Categoria',
            value: config.category_id ? `<#${config.category_id}>` : '❌ Non impostata',
            inline: true
          },
          {
            name: 'Canale di Controllo',
            value: config.control_channel_id ? `<#${config.control_channel_id}>` : '❌ Non impostato',
            inline: true
          },
          {
            name: 'Template Nome Canale',
            value: `\`${config.channel_name_template}\``,
            inline: false
          },
          {
            name: 'Limite Utenti Predefinito',
            value: config.default_user_limit > 0 ? `${config.default_user_limit}` : ' Nessun limite',
            inline: true
          },
          {
            name: 'Max Canali Simultanei',
            value: `${config.max_channels}`,
            inline: true
          }
        ],
        footer: {
          text: 'Usa /config set per modificare queste impostazioni'
        }
      };
      
      return await interaction.reply({
        embeds: [viewEmbed],
        ephemeral: true
      });
      
    case 'set':
      const generatorChannel = interaction.options.getChannel('generator_channel');
      const category = interaction.options.getChannel('category');
      const controlChannel = interaction.options.getChannel('control_channel');
      const channelNameTemplate = interaction.options.getString('channel_name_template');
      const defaultUserLimit = interaction.options.getInteger('default_user_limit');
      const maxChannels = interaction.options.getInteger('max_channels');
      
      // Verifica che i canali siano del tipo corretto
      if (generatorChannel && generatorChannel.type !== 2) { // Voice channel
        return await interaction.reply({
          content: '❌ Il canale generatore deve essere un canale vocale!',
          ephemeral: true
        });
      }
      
      if (category && category.type !== 4) { // Category
        return await interaction.reply({
          content: '❌ La categoria deve essere una categoria!',
          ephemeral: true
        });
      }
      
      if (controlChannel && controlChannel.type !== 0) { // Text channel
        return await interaction.reply({
          content: '❌ Il canale di controllo deve essere un canale testuale!',
          ephemeral: true
        });
      }
      
      // Aggiorna la configurazione
      const newSettings = {};
      
      if (generatorChannel) newSettings.generator_channel_id = generatorChannel.id;
      if (category) newSettings.category_id = category.id;
      if (controlChannel) newSettings.control_channel_id = controlChannel.id;
      if (channelNameTemplate) newSettings.channel_name_template = channelNameTemplate;
      if (defaultUserLimit !== null) newSettings.default_user_limit = defaultUserLimit;
      if (maxChannels !== null) newSettings.max_channels = maxChannels;
      
      setGuildSettings(interaction.guildId, newSettings);
      
      const setEmbed = {
        color: 0x00ff00,
        title: '✅ Configurazione Aggiornata',
        description: 'Le impostazioni sono state aggiornate con successo!',
        fields: [
          {
            name: 'Canale Generatore',
            value: generatorChannel ? `<#${generatorChannel.id}>` : 'Non modificato',
            inline: true
          },
          {
            name: 'Categoria',
            value: category ? `<#${category.id}>` : 'Non modificata',
            inline: true
          },
          {
            name: 'Template Nome Canale',
            value: channelNameTemplate ? `\`${channelNameTemplate}\`` : 'Non modificato',
            inline: false
          }
        ]
      };
      
      return await interaction.reply({
        embeds: [setEmbed],
        ephemeral: true
      });
      
    case 'reset':
      // Resetta la configurazione in memoria
      serverSettings = {
        generator_channel_id: null,
        category_id: null,
        control_channel_id: null,
        channel_name_template: '🔊 Stanza di {username}',
        default_user_limit: 0,
        max_channels: 10
      };
      
      return await interaction.reply({
        content: '✅ Configurazione resettata alle impostazioni predefinite!',
        ephemeral: true
      });
      
    default:
      return await interaction.reply({
        content: '❌ Sottocomando non riconosciuto.',
        ephemeral: true
      });
  }
}

module.exports = { handleConfigCommand };