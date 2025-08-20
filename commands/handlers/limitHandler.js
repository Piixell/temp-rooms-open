// Simulazione di canali temporanei in memoria
let temporaryChannels = {};

// Funzione per ottenere un canale temporaneo (simulazione)
function getTemporaryChannel(channelId) {
  return temporaryChannels[channelId] || null;
}

// Funzione per impostare il limite utenti di un canale (simulazione)
function setChannelUserLimit(channelId, userLimit) {
  if (temporaryChannels[channelId]) {
    temporaryChannels[channelId].user_limit = userLimit;
  }
  // In un'implementazione reale, qui andrebbe salvato su file
}

async function handleLimitCommand(interaction) {
  // Verifica che l'utente sia in un canale vocale
  if (!interaction.member.voice.channel) {
    return await interaction.reply({
      content: '❌ Devi essere in un canale vocale per usare questo comando!',
      ephemeral: true
    });
  }
  
  const channel = interaction.member.voice.channel;
  const limit = interaction.options.getInteger('numero');
  
  // Verifica che il limite sia valido
  if (limit < 0 || limit > 99) {
    return await interaction.reply({
      content: '❌ Il limite utenti deve essere compreso tra 0 e 99 (0 = nessun limite)!',
      ephemeral: true
    });
  }
  
  try {
    // Imposta il limite utenti sul canale
    await channel.setUserLimit(limit);
    
    // Aggiorna il limite nella memoria (simulazione)
    setChannelUserLimit(channel.id, limit);
    
    return await interaction.reply({
      content: `✅ Limite utenti impostato a ${limit} per il canale ${channel.name}!`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Error setting channel user limit:', error);
    return await interaction.reply({
      content: '❌ Si è verificato un errore durante l\'impostazione del limite utenti. Assicurati che il bot abbia i permessi necessari.',
      ephemeral: true
    });
  }
}

module.exports = { handleLimitCommand };