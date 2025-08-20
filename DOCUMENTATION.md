# TempRooms - Documentazione Tecnica Completa

## 1. Introduzione

TempRooms è un bot Discord avanzato per la creazione di canali vocali temporanei, progettato come servizio SaaS (Software as a Service) completamente configurabile tramite dashboard web. Il bot permette agli utenti di creare canali vocali personalizzati unendosi a un canale "generatore", con eliminazione automatica quando il canale diventa vuoto.

## 2. Architettura del Sistema

### 2.1 Componenti Principali

1. **Bot Discord** - Core functionality per la creazione/eliminazione canali
2. **Dashboard Web** - Interfaccia di configurazione (Express.js + Handlebars)
3. **Database SQLite** - Archiviazione configurazioni e dati utenti
4. **Sistema di Abbonamento** - Gestione piani (free, basic, premium)
5. **Webhooks** - Integrazione pagamenti (Stripe)
6. **Middleware** - Controllo accessi e limiti

### 2.2 Tecnologie Utilizzate

- **Node.js** v22+
- **discord.js** v14
- **Express.js** per il server web
- **SQLite** per database
- **Handlebars** per templating
- **Bootstrap 5** per UI
- **Stripe** per pagamenti

## 3. Struttura del Progetto

```
/temp-rooms
├── index.js                    # Entry point principale (bot + server web)
├── package.json               # Dipendenze e script
├── .env                       # Configurazione ambiente
├── .env.example              # Template configurazione
├── README.md                 # Documentazione utente
├── LICENSE                   # Licenza MIT
├── database/
│   └── db.js                # Gestione database SQLite
├── commands/
│   ├── register-commands.js # Registrazione comandi slash
│   └── handlers/            # Gestori comandi slash
│       ├── configHandler.js
│       ├── setupHandler.js
│       ├── subscribeHandler.js
│       └── limitHandler.js
├── middleware/
│   └── subscriptionMiddleware.js # Controllo abbonamenti
├── webhooks/
│   └── stripe.js            # Gestione webhook pagamenti
├── views/
│   ├── dashboard.handlebars # Pagina dashboard principale
│   ├── servers.handlebars   # Gestione server
│   └── layouts/
│       └── main.handlebars # Layout base
└── public/
    └── styles.css          # CSS personalizzati
```

## 4. Funzionalità Principali

### 4.1 Creazione Canali Temporanei

- **Attivazione**: Unione al canale "generatore" configurato
- **Personalizzazione**: Nome canale con template configurabile
- **Posizionamento**: Canali creati nella categoria specificata
- **Limiti Utenti**: Impostazione automatica del limite utenti
- **Eliminazione**: Rimozione automatica quando il canale è vuoto

### 4.2 Configurazione tramite Dashboard Web

#### 4.2.1 Parametri Configurabili
- **Canale Generatore**: Canale vocale che attiva la creazione
- **Categoria**: Categoria in cui creare i canali temporanei
- **Canale di Controllo**: Canale testo per notifiche
- **Template Nome**: Formato personalizzato per i nomi canali
- **Limite Utenti Predefinito**: Limite massimo utenti per nuovo canale

#### 4.2.2 Funzionalità Dashboard
- Gestione multi-server
- Configurazione in tempo reale
- Visualizzazione stato server
- Test configurazione
- Reset impostazioni

### 4.3 Comandi Discord Slash

```
/setup     - Guida configurazione iniziale
/config    - Configurazione parametri server
/subscribe - Informazioni abbonamento
/limit     - Imposta limite utenti canale corrente
```

### 4.4 Sistema di Abbonamento

#### 4.4.1 Piani Disponibili
- **Free**: 5 canali simultanei, funzionalità base
- **Basic**: 20 canali simultanei, template personalizzabili
- **Premium**: Canali illimitati, supporto prioritario

#### 4.4.2 Funzionalità Premium
- Canali vocali illimitati
- Template nome canale avanzati
- Supporto tecnico prioritario
- Accesso anticipato a nuove funzionalità

## 5. Configurazione Ambiente

### 5.1 File .env

```env
DISCORD_TOKEN=token_bot_discord
CLIENT_ID=id_applicazione_discord
DATABASE_URL=sqlite:database/database.sqlite
STRIPE_WEBHOOK_SECRET=secret_webhook_stripe
PORT=3000
```

### 5.2 Variabili Database

#### Tabella `guild_settings`
```sql
guild_id              -- ID server Discord (PK)
generator_channel_id  -- ID canale generatore
category_id           -- ID categoria canali
channel_name_template -- Template nome canale
max_channels          -- Limite canali simultanei
control_channel_id    -- ID canale controllo
default_user_limit    -- Limite utenti predefinito
```

#### Tabella `subscriptions`
```sql
subscription_id       -- ID sottoscrizione (PK)
guild_id             -- ID server (FK)
plan_type            -- Tipo piano (free/basic/premium)
status               -- Stato (active/expired)
expiry_date          -- Data scadenza
```

#### Tabella `temporary_channels`
```sql
channel_id           -- ID canale (PK)
guild_id             -- ID server
owner_id             -- ID proprietario
user_limit           -- Limite utenti
```

## 6. Avvio e Gestione

### 6.1 Comandi NPM

```bash
npm start              # Avvia il bot
npm run deploy-commands # Registra comandi slash
npm run dev            # Avvia in modalità sviluppo (con nodemon)
```

### 6.2 Porte Utilizzate

- **Porta 3000**: Dashboard web e API
- **Porta Discord**: Connessione API Discord (gestita automaticamente)

### 6.3 Requisiti di Sistema

- Node.js v16.6.0 o superiore
- Accesso a Discord Developer Portal
- Account Stripe per pagamenti (opzionale)

## 7. Personalizzazione e Estensione

### 7.1 Aggiunta Nuove Funzionalità

1. **Nuovi Comandi**: Creare handler in `commands/handlers/`
2. **Nuove Rotte**: Aggiungere endpoint in `index.js`
3. **Nuovi Template**: Modificare i file `.handlebars` in `views/`
4. **Nuove Tabelle**: Aggiornare lo schema in `database/db.js`

### 7.2 Personalizzazione UI

- **CSS**: Modificare `public/styles.css`
- **Layout**: Modificare `views/layouts/main.handlebars`
- **Pagine**: Modificare i file `.handlebars` in `views/`

### 7.3 Integrazione Pagamenti

Il sistema è preconfigurato per Stripe:
1. Configurare `STRIPE_WEBHOOK_SECRET` in `.env`
2. Implementare logica business in `webhooks/stripe.js`
3. Aggiornare i piani in `commands/handlers/subscribeHandler.js`

## 8. Troubleshooting

### 8.1 Problemi Comuni

**Porta già in uso**: 
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

**Errori configurazione canali**:
- Verificare che gli ID siano numerici (non nomi)
- Controllare i permessi del bot nel server

**Comandi non funzionanti**:
- Eseguire `npm run deploy-commands`
- Verificare `CLIENT_ID` in `.env`

### 8.2 Log e Debug

- **Console**: Output standard per debugging
- **File log**: Implementare con `winston` o similare
- **Monitoraggio**: Aggiungere logging dettagliato nei punti critici

## 9. Sicurezza

### 9.1 Best Practice Implementate

- Separazione configurazione (.env)
- Validazione input utente
- Controllo permessi amministratore
- Sanitizzazione dati database
- Crittografia dati sensibili (implementabile)

### 9.2 Aree di Miglioramento

- Implementazione autenticazione dashboard
- Aggiunta rate limiting API
- Crittografia dati sensibili
- Backup database automatico
- Monitoraggio errori produzione

## 10. Scalabilità e Performance

### 10.1 Considerazioni

- SQLite sufficiente per installazioni small-medium
- Per scalabilità: considerare PostgreSQL/MySQL
- Cache configurazioni in memoria
- Ottimizzazione query database
- Load balancing per istanze multiple

### 10.2 Monitoraggio

- Tempo di risposta API
- Utilizzo risorse server
- Numero utenti/connessi
- Errori sistema
