# Temp Rooms - Bot Discord per Canali Vocali Temporanei

**Temp Rooms** è un bot Discord che permette di creare canali vocali temporanei. Quando un utente si unisce a un canale "generatore" specifico, il bot crea automaticamente un nuovo canale vocale personalizzato per quell'utente. Il canale viene eliminato automaticamente quando rimane vuoto.

Questa è la versione SaaS del bot, progettata per essere distribuita commercialmente come servizio multi-tenant.

## Funzionalità

- **Creazione automatica**: Unisciti al canale generatore per creare istantaneamente un canale vocale personalizzato
- **Eliminazione automatica**: I canali vengono eliminati automaticamente quando diventano vuoti
- **Personalizzazione**: Ogni canale creato avrà un nome personalizzato con il nome dell'utente
- **Sicurezza**: Solo gli utenti del server possono accedere ai canali temporanei
- **Multi-Tenant**: Supporto per più server Discord con configurazioni indipendenti
- **Sistema di Abbonamento**: Piani gratuiti e a pagamento con funzionalità avanzate
- **Configurazione Dinamica**: Comandi slash per configurare il bot direttamente da Discord

## Requisiti

- [Node.js](https://nodejs.org/) v16.6.0 o superiore
- Un bot Discord registrato su [Discord Developer Portal](https://discord.com/developers/applications)
- Accesso a un database SQLite (incluso)

## Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/Piixell/temp-rooms-open.git
   cd temp-rooms-open
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Crea un file `.env` nella directory principale del progetto:
   ```bash
   cp .env.example .env
   ```

4. Configura le variabili d'ambiente nel file `.env`:
   ```env
   DISCORD_TOKEN=il_tuo_token_del_bot
   CLIENT_ID=ID_della_tua_applicazione_Discord
   PORT=3000
   ```

5. Registra i comandi slash del bot:
   ```bash
   npm run deploy-commands
   ```

## Configurazione del Bot su Discord

1. Crea un nuovo bot sul [Discord Developer Portal](https://discord.com/developers/applications)
2. Copia il token del bot e l'ID dell'applicazione e incollali nelle rispettive variabili del file `.env`
3. Invita il bot al tuo server utilizzando OAuth2 URL Generator con i permessi necessari
4. Crea un canale vocale che fungerà da "generatore" (es. "➕ Crea Stanza")
5. Crea una categoria in cui i canali temporanei verranno creati
6. Usa i comandi slash per configurare il bot:
   - `/setup` - Guida per la configurazione iniziale
   - `/config set` - Imposta le configurazioni del server
   - `/config view` - Visualizza le configurazioni attuali

## Avvio del Bot

Per avviare il bot, esegui:

```bash
npm start
```

Oppure direttamente con Node.js:

```bash
node index.js
```

Se il bot si avvia correttamente, vedrai il messaggio "TempRooms è online!" nella console.

## Utilizzo

1. Usa `/setup` per la configurazione iniziale
2. Usa `/config set generator_channel #nome-canale` per impostare il canale generatore
3. Usa `/config set category #nome-categoria` per impostare la categoria
4. Unisciti al canale vocale "generatore" che hai configurato
5. Il bot creerà automaticamente un nuovo canale vocale personalizzato per te
6. Quando tutti gli utenti lasciano il canale, verrà eliminato automaticamente

## Comandi Disponibili

- `/setup` - Guida alla configurazione iniziale
- `/config view` - Visualizza la configurazione attuale
- `/config set` - Imposta una configurazione
- `/config reset` - Ripristina le impostazioni di default
- `/subscribe` - Informazioni sugli abbonamenti e come effettuare l'upgrade

## Struttura del Progetto

```
/temp-rooms-open
├── index.js                    # Codice principale del bot e server webhook
├── package.json               # Dipendenze e informazioni del progetto
├── .env.example               # File di esempio per le variabili d'ambiente
├── .gitignore                 # File da ignorare nel controllo versione
├── README.md                  # Questo file
├── database/
│   └── db.js                 # Gestione del database
├── commands/
│   ├── deploy-commands.js    # Script per registrare i comandi slash
│   └── handlers/             # Gestori per i comandi slash
│       ├── configHandler.js
│       ├── setupHandler.js
│       └── subscribeHandler.js
├── middleware/
│   └── subscriptionMiddleware.js  # Middleware per la gestione degli abbonamenti
└── webhooks/
    └── stripe.js             # Gestione dei webhook di Stripe
```

## Tecnologie Utilizzate

- [Node.js](https://nodejs.org/)
- [discord.js](https://discord.js.org/) v14
- [Express.js](https://expressjs.com/) per il server webhook
- [SQLite](https://www.sqlite.org/) per il database
- [Stripe](https://stripe.com/) per i pagamenti
- [dotenv](https://github.com/motdotla/dotenv) per la gestione delle variabili d'ambiente

## Piani di Abbonamento

### Piano Gratuito
- Creazione di canali vocali temporanei
- Eliminazione automatica quando vuoti
- Fino a 5 canali simultanei

### Piano Premium (€1,49/mese)
- Tutte le funzionalità del piano gratuito
- Canali illimitati
- Supporto prioritario
- Nuove features in anteprima

## Contribuire

1. Forka il progetto
2. Crea un branch per la tua feature (`git checkout -b feature/NuovaFeature`)
3. Fai commit delle tue modifiche (`git commit -m 'Aggiungi nuova feature'`)
4. Push al branch (`git push origin feature/NuovaFeature`)
5. Apri una Pull Request

## Licenza

Questo progetto è distribuito sotto la licenza MIT. Vedi il file `LICENSE` per ulteriori informazioni.

## Supporto

Per qualsiasi problema o domanda, apri una issue su GitHub o contatta lo sviluppatore.
