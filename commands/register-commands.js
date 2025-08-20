const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Definizione dei comandi con maggiore dettaglio
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
                name: 'Canale di Controllo',
                value: 'control_channel'
              },
              {
                name: 'Template Nome Canale',
                value: 'channel_name_template'
              },
              {
                name: 'Numero Massimo di Canali',
                value: 'max_channels'
              },
              {
                name: 'Limite Utenti Predefinito',
                value: 'default_user_limit'
              }
            ]
          },
          {
            name: 'value',
            description: 'Il valore dell\'impostazione (usa "none" per rimuovere)',
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
  },
  {
    name: 'limit',
    description: 'Imposta il limite di utenti per il tuo canale vocale',
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
    console.log('CLIENT_ID:', process.env.CLIENT_ID);
    console.log('Numero di comandi da registrare:', commands.length);

    // Registra i comandi globalmente
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`Registrati con successo ${data.length} comandi dell'applicazione.`);
    
    // Stampa i nomi dei comandi registrati
    data.forEach((cmd, index) => {
      console.log(`${index + 1}. ${cmd.name} - ${cmd.description}`);
    });
  } catch (error) {
    console.error('Errore durante la registrazione dei comandi:', error);
  }
})();
