# Usiamo l'immagine standard di Node.js invece di quella Alpine
FROM node:18

# Impostare la directory di lavoro all'interno del container
WORKDIR /usr/src/app

# Copiare i file delle dipendenze
COPY package*.json ./

# Installare le dipendenze di produzione
RUN npm install --only=production

# Copiare tutto il resto del codice sorgente dell'applicazione
COPY . .

# Esponiamo la porta per i webhook
EXPOSE 3000

# Comando per avviare il bot
CMD [ "npm", "start" ]
