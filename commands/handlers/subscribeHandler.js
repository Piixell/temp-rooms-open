// Simulazione di sottoscrizione in memoria
let serverSubscription = {
  plan_type: 'free',
  status: 'active'
};

// Funzione per ottenere la sottoscrizione (simulazione)
function getSubscription(guildId) {
  return serverSubscription;
}

async function handleSubscribeCommand(interaction) {
  const subscription = getSubscription(interaction.guildId);
  
  const embed = {
    color: 0xffd700,
    title: '💎 Abbonamento TempRooms',
    description: 'Sblocca funzionalità avanzate con il nostro piano Premium!',
    fields: [
      {
        name: ' Piano Attuale',
        value: subscription.plan_type === 'premium' ? '⭐ Premium' : '🆓 Gratuito',
        inline: false
      },
      {
        name: ' vantaggi del Piano Gratuito',
        value: '• Creazione di canali vocali temporanei\n• Eliminazione automatica quando vuoti\n• Fino a 5 canali simultanei',
        inline: false
      },
      {
        name: ' vantaggi del Piano Premium (€1,49/mese)',
        value: '• Tutte le funzionalità del piano gratuito\n• Canali illimitati\n• Supporto prioritario\n• Nuove features in anteprima',
        inline: false
      },
      {
        name: 'Come effettuare l\'upgrade',
        value: 'Per effettuare l\'upgrade, contatta il proprietario del bot per ottenere un link di pagamento personalizzato.',
        inline: false
      }
    ],
    footer: {
      text: 'Grazie per il tuo supporto!'
    }
  };
  
  return await interaction.reply({
    embeds: [embed],
    ephemeral: true
  });
}

module.exports = { handleSubscribeCommand };