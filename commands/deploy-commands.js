const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'config',
    description: 'Configura le impostazioni del bot per questo server',
    options: [
      {
        name: 'view',
        description: 'Visualizza la configurazione attuale',
        type: 1, // SUB_COMMAND
      },
      {
        name: 'set',
        description: 'Imposta una configurazione',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'generator_channel',
            description: 'Imposta il canale generatore',
            type: 7, // CHANNEL
            channel_types: [2], // Voice channel
          },
          {
            name: 'category',
            description: 'Imposta la categoria per i canali temporanei',
            type: 7, // CHANNEL
            channel_types: [4], // Category
          },
          {
            name: 'control_channel',
            description: 'Imposta il canale di controllo',
            type: 7, // CHANNEL
            channel_types: [0], // Text channel
          },
          {
            name: 'channel_name_template',
            description: 'Template per i nomi dei canali (usa {username} o #)',
            type: 3, // STRING
          },
          {
            name: 'default_user_limit',
            description: 'Limite utenti predefinito per i nuovi canali',
            type: 4, // INTEGER
            min_value: 0,
            max_value: 99
          },
          {
            name: 'max_channels',
            description: 'Numero massimo di canali simultanei',
            type: 4, // INTEGER
            min_value: 1,
            max_value: 100
          }
        ]
      },
      {
        name: 'reset',
        description: 'Ripristina le impostazioni di default',
        type: 1, // SUB_COMMAND
      }
    ]
  },
  {
    name: 'setup',
    description: 'Guida per la configurazione iniziale del bot'
  },
  {
    name: 'limit',
    description: 'Imposta il limite di utenti per il canale corrente',
    options: [
      {
        name: 'numero',
        description: 'Numero massimo di utenti (0 per nessun limite)',
        type: 4, // INTEGER
        required: true,
        min_value: 0,
        max_value: 99
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Inizio registrazione dei comandi dell\'applicazione.');

    // Registra i comandi globalmente
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`Registrati con successo ${data.length} comandi dell'applicazione.`);
  } catch (error) {
    console.error(error);
  }
})();
