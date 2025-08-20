module.exports = {
  handleSetupCommand: async (interaction) => {
    // Verifica che l'utente abbia permessi di amministrazione
    if (!interaction.member.permissions.has('Administrator')) {
      return await interaction.reply({
        content: '❌ Solo gli amministratori possono configurare il bot!',
        ephemeral: true
      });
    }

    const setupGuide = `
🔧 **Guida alla Configurazione di TempRooms**

Benvenuto! Segui questi passaggi per configurare TempRooms sul tuo server:

1. **Crea un canale vocale "generatore"**
   - Questo è il canale a cui gli utenti si uniranno per creare nuove stanze
   - Esempio: "➕ Crea Stanza"

2. **Crea una categoria per i canali temporanei**
   - Tutti i canali creati saranno posizionati in questa categoria

3. **Configura il bot con i comandi:**
   \`\`\`
   /config set generator_channel #nome-canale
   /config set category #nome-categoria
   \`\`\`

4. **(Opzionale) Personalizza ulteriormente:**
   \`\`\`
   /config set channel_name_template "🔊 Stanza di {username}"
   /config set max_channels 10
   \`\`\`

💡 **Suggerimento:** Puoi sempre visualizzare la configurazione attuale con \`/config view\`

Hai bisogno di aiuto? Usa \`/subscribe\` per informazioni sui piani a pagamento o contatta il supporto.
    `.trim();

    return await interaction.reply({
      content: setupGuide,
      ephemeral: true
    });
  }
};
