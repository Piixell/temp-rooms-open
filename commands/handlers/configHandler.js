const { getGuildSettings, setGuildSettings } = require('../../database/db');

module.exports = {
  handleConfigCommand: async (interaction) => {
    // Verifica che l'utente abbia permessi di amministrazione
    if (!interaction.member.permissions.has('Administrator')) {
      return await interaction.reply({
        content: '❌ Solo gli amministratori possono configurare il bot!',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    switch (subcommand) {
      case 'view':
        return await handleViewConfig(interaction, guildId);
      case 'set':
        return await handleSetConfig(interaction, guildId);
      case 'reset':
        return await handleResetConfig(interaction, guildId);
      default:
        return await interaction.reply({
          content: '❌ Comando non riconosciuto.',
          ephemeral: true
        });
    }
  }
};

async function handleViewConfig(interaction, guildId) {
  const settings = await getGuildSettings(guildId);
  
  if (!settings) {
    return await interaction.reply({
      content: 'ℹ️ Il bot non è ancora configurato per questo server. Usa `/config set` per iniziare.',
      ephemeral: true
    });
  }

  // Verifica se gli ID sembrano validi
  const generatorValid = settings.generator_channel_id && /^\d+$/.test(settings.generator_channel_id);
  const categoryValid = settings.category_id && /^\d+$/.test(settings.category_id);
  const controlValid = settings.control_channel_id && /^\d+$/.test(settings.control_channel_id);

  const response = `
**🔧 Configurazione Attuale**

**Canale Generatore:** ${generatorValid ? `<#${settings.generator_channel_id}>` : `ID: ${settings.generator_channel_id || 'Non impostato'}`}
**Categoria:** ${categoryValid ? `<#${settings.category_id}>` : `ID: ${settings.category_id || 'Non impostato'}`}
**Canale di Controllo:** ${controlValid ? `<#${settings.control_channel_id}>` : `ID: ${settings.control_channel_id || 'Non impostato'}`}
**Template Nome Canale:** \`${settings.channel_name_template}\`
**Numero Massimo di Canali:** ${settings.max_channels}
**Limite Utenti Predefinito:** ${settings.default_user_limit > 0 ? settings.default_user_limit : 'Nessun limite'}

❗ *Nota: Assicurati di usare gli ID numerici dei canali, non i nomi. Abilita la "Modalità sviluppatore" in Discord per copiare gli ID.*
  `.trim();

  return await interaction.reply({
    content: response,
    ephemeral: true
  });
}

async function handleSetConfig(interaction, guildId) {
  const setting = interaction.options.getString('setting');
  let value = interaction.options.getString('value');
  
  // Se il valore è un menzionamento di canale, estrai l'ID
  if (value.startsWith('<#') && value.endsWith('>')) {
    value = value.slice(2, -1);
  }
  
  // Validazione dell'ID (deve essere un numero) per canali e categorie
  if (setting === 'generator_channel' || setting === 'category' || setting === 'control_channel') {
    if (value !== 'none' && !/^\d+$/.test(value)) {
      return await interaction.reply({
        content: `❌ L'ID del ${setting === 'generator_channel' ? 'canale generatore' : setting === 'category' ? 'categoria' : 'canale di controllo'} deve essere un numero valido o "none" per rimuoverlo.\n\n💡 *Abilita la "Modalità sviluppatore" in Discord, fai clic destro sul canale e seleziona "Copia ID".*`,
        ephemeral: true
      });
    }
  }
  
  // Validazione per il limite utenti
  if (setting === 'default_user_limit') {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 99) {
      return await interaction.reply({
        content: '❌ Il limite utenti deve essere un numero tra 0 e 99 (0 = nessun limite).',
        ephemeral: true
      });
    }
  }
  
  // Ottieni le impostazioni attuali o crea un oggetto vuoto
  let settings = await getGuildSettings(guildId);
  if (!settings) {
    settings = {
      generator_channel_id: null,
      category_id: null,
      channel_name_template: '🔊 Stanza di {username}',
      max_channels: 10,
      control_channel_id: null,
      default_user_limit: 0
    };
  }

  // Aggiorna l'impostazione specificata
  switch (setting) {
    case 'generator_channel':
      settings.generator_channel_id = value === 'none' ? null : value;
      break;
    case 'category':
      settings.category_id = value === 'none' ? null : value;
      break;
    case 'control_channel':
      settings.control_channel_id = value === 'none' ? null : value;
      break;
    case 'channel_name_template':
      settings.channel_name_template = value;
      break;
    case 'max_channels':
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1 || numValue > 50) {
        return await interaction.reply({
          content: '❌ Il numero massimo di canali deve essere un numero tra 1 e 50.',
          ephemeral: true
        });
      }
      settings.max_channels = numValue;
      break;
    case 'default_user_limit':
      const userLimit = parseInt(value);
      settings.default_user_limit = userLimit;
      break;
  }

  // Salva le impostazioni
  await setGuildSettings(guildId, settings);

  // Mostra una conferma con il nome del canale se possibile
  let displayValue = value;
  if ((setting === 'generator_channel' || setting === 'category' || setting === 'control_channel') && /^\d+$/.test(value)) {
    displayValue = `<#${value}> (ID: ${value})`;
  } else if (setting === 'default_user_limit') {
    displayValue = value > 0 ? `${value} utenti` : 'Nessun limite';
  } else if (value === 'none') {
    displayValue = 'Rimosso';
  }

  return await interaction.reply({
    content: `✅ Impostazione \`${setting}\` aggiornata con successo a: ${displayValue}`,
    ephemeral: true
  });
}

async function handleResetConfig(interaction, guildId) {
  // Impostazioni di default
  const defaultSettings = {
    generator_channel_id: null,
    category_id: null,
    channel_name_template: '🔊 Stanza di {username}',
    max_channels: 10,
    control_channel_id: null,
    default_user_limit: 0
  };

  await setGuildSettings(guildId, defaultSettings);

  return await interaction.reply({
    content: '✅ Configurazione ripristinata ai valori di default.',
    ephemeral: true
  });
}
