# TempRooms - Documentazione Tecnica Completa

## 1. Introduzione

TempRooms è un bot Discord avanzato per la creazione di canali vocali temporanei, progettato come servizio SaaS (Software as a Service) completamente configurabile tramite comandi slash. Il bot permette agli utenti di creare canali vocali personalizzati unendosi a un canale "generatore", con eliminazione automatica quando il canale diventa vuoto.

## 2. Architettura del Sistema

### 2.1 Componenti Principali

1. **Bot Discord** - Core functionality per la creazione/eliminazione canali
2. **Configurazione in memoria** - Configurazione tramite variabili d'ambiente

### 2.2 Tecnologie Utilizzate

- **Node.js** v22+
- **discord.js** v14

## 3. Struttura del Progetto

```
/temp-rooms
├── index.js                    # Entry point principale (bot)
├── package.json               # Dipendenze e script
├── .env                       # Configurazione ambiente
├── .env.example              # Template configurazione
├── README.md                 # Documentazione utente
├── LICENSE                   # Licenza MIT
├── commands/
│   ├── register-commands.js # Registrazione comandi slash
│   └── handlers/            # Gestori comandi slash
│       ├── configHandler.js
│       ├── setupHandler.js
│       └── limitHandler.js
├── middleware/
│   └── subscriptionMiddleware.js # Funzioni di utilità per il controllo delle funzionalità
```

## 4. Funzionalità Principali

### 4.1 Creazione Canali Temporanei

Il bot monitora gli stati vocali degli utenti e crea canali temporanei quando un utente si unisce al canale "generatore".

### 4.2 Eliminazione Automatica

I canali vengono eliminati automaticamente quando diventano vuoti.

### 4.3 Personalizzazione Nomi

Supporta due formati per i nomi dei canali:
- `{username}` - Include il nome dell'utente
- `#` - Numerazione progressiva

## 5. Configurazione

### 5.1 Variabili d'Ambiente

Le configurazioni sono gestite tramite il file `.env`:

```
DISCORD_TOKEN=                    # Token del bot Discord
CLIENT_ID=                       # ID dell'applicazione Discord
PORT=3000                        # Porta del server (non utilizzata in questa versione)

# Configurazione Canali
GENERATOR_CHANNEL_ID=            # ID del canale generatore
CATEGORY_ID=                     # ID della categoria per i canali temporanei
CONTROL_CHANNEL_ID=              # ID del canale di controllo (opzionale)
CHANNEL_NAME_TEMPLATE=           # Template per i nomi dei canali
DEFAULT_USER_LIMIT=              # Limite utenti predefinito
MAX_CHANNELS=                    # Numero massimo di canali simultanei
```

### 5.2 Comandi di Configurazione

- `/config view` - Visualizza la configurazione attuale
- `/config set` - Imposta le configurazioni
- `/config reset` - Resetta la configurazione

## 6. Comandi Disponibili

### 6.1 Comandi Utente

- `/setup` - Guida alla configurazione iniziale
- `/limit` - Imposta il limite di utenti per il canale corrente

### 6.2 Comandi Amministratore

- `/config` - Comandi di configurazione completa

## 7. Sicurezza

Il bot implementa controlli di sicurezza per:
- Verifica permessi amministratore per configurazioni
- Gestione errori robusta

## 8. Limitazioni della Versione Semplificata

Questa versione semplificata ha alcune limitazioni rispetto alla versione completa:

1. **Configurazione**: Gestita solo tramite variabili d'ambiente, non dashboard web
2. **Persistenza**: Le configurazioni non vengono salvate tra i riavvii
3. **Database**: Tutti i dati sono gestiti in memoria

## 9. Estendibilità

Il sistema è progettato per essere facilmente estendibile:
- Aggiunta nuovi comandi slash
- Implementazione sistemi di persistenza
