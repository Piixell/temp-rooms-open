const { getSubscription } = require('../../database/db');

module.exports = {
  handleSubscribeCommand: async (interaction) => {
    const guildId = interaction.guildId;
    const subscription = await getSubscription(guildId);
    
    const plan = subscription ? subscription.plan_type : 'free';
    const status = subscription ? subscription.status : 'active';
    
    let response = '';
    
    switch (plan) {
      case 'free':
        response = `
📢 **Piano Gratuito**
Hai il piano gratuito che include funzionalità di base.

✨ **Funzionalità incluse:**
- Creazione di canali vocali temporanei
- Eliminazione automatica quando vuoti
- Fino a 5 canali simultanei

🚀 **Effettua l'upgrade per sbloccare:**
- Canali illimitati
- Personalizzazione avanzata
- Supporto prioritario
- E molto altro!

👉 Clicca qui per effettuare l'upgrade: https://tuosito.com/upgrade
        `.trim();
        break;
        
      case 'basic':
        response = `
🌟 **Piano Basic**
Sei nel piano Basic attivo!

✨ **Funzionalità incluse:**
- Creazione di canali vocali temporanei
- Eliminazione automatica quando vuoti
- Fino a 20 canali simultanei
- Template nome canale personalizzabile
        `.trim();
        break;
        
      case 'premium':
        response = `
💎 **Piano Premium**
Sei nel piano Premium attivo! Grazie per il tuo supporto!

✨ **Funzionalità incluse:**
- Creazione illimitata di canali vocali temporanei
- Eliminazione automatica quando vuoti
- Template nome canale personalizzabile
- Supporto prioritario
- Accesso anticipato a nuove funzionalità
        `.trim();
        break;
        
      default:
        response = `
❓ **Stato sconosciuto**
Impossibile determinare il tuo piano di abbonamento.

👉 Contatta il supporto o visita: https://tuosito.com/subscribe
        `.trim();
    }
    
    return await interaction.reply({
      content: response,
      ephemeral: true
    });
  }
};
