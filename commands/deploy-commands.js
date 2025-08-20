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
            name: 'setting',
            description: 'L\'impostazione da modificare',
            type: 3, // STRING
            required: true,
            choices: [
              {
                name: 'Canale Generatore',
                value: 'generator_channel'
              },
              {
                name: 'Categoria',
                value: 'category'
              },
              {
                name: 'Template Nome Canale',
                value: 'channel_name_template'
              },
              {
                name: 'Numero Massimo di Canali',
                value: 'max_channels'
              }
            ]
          },
          {
            name: 'value',
            description: 'Il valore dell\'impostazione',
            type: 3, // STRING
            required: true
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
    name: 'subscribe',
    description: 'Informazioni sull\'abbonamento e come effettuare l\'upgrade'
  },
  {
    name: 'setup',
    description: 'Guida per la configurazione iniziale del bot'
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
