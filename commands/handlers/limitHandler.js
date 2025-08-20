const { getTemporaryChannel, setChannelUserLimit } = require('../../database/db');

module.exports = {
  handleLimitCommand: async (interaction) => {
    // Verifica che l'utente sia in un canale vocale
    if (!interaction.member.voice.channel) {
      return await interaction.reply({
        content: '❌ Devi essere in un canale vocale per usare questo comando!',
        ephemeral: true
      });
    }

    const channelId = interaction.member.voice.channel.id;
    const userLimit = interaction.options.getInteger('numero');
    
    // Verifica se il canale è un canale temporaneo
    const tempChannel = await getTemporaryChannel(channelId);
    
    if (!tempChannel) {
      return await interaction.reply({
        content: '❌ Questo comando può essere usato solo nei canali vocali temporanei creati dal bot!',
        ephemeral: true
      });
    }
    
    // Verifica che l'utente sia il proprietario del canale o un amministratore
    if (tempChannel.owner_id !== interaction.user.id && !interaction.member.permissions.has('Administrator')) {
      return await interaction.reply({
        content: '❌ Solo il proprietario del canale o un amministratore può cambiare il limite utenti!',
        ephemeral: true
      });
    }
    
    try {
      // Aggiorna il limite utenti nel database
      await setChannelUserLimit(channelId, userLimit);
      
      // Aggiorna il limite utenti nel canale Discord
      await interaction.member.voice.channel.edit({
        userLimit: userLimit
      });
      
      const response = userLimit > 0 
        ? `✅ Limite utenti impostato a ${userLimit} per il canale ${interaction.member.voice.channel.name}`
        : `✅ Limite utenti rimosso per il canale ${interaction.member.voice.channel.name}`;
      
      return await interaction.reply({
        content: response,
        ephemeral: true
      });
    } catch (error) {
      console.error('Errore nell\'impostazione del limite utenti:', error);
      return await interaction.reply({
        content: '❌ Si è verificato un errore durante l\'impostazione del limite utenti.',
        ephemeral: true
      });
    }
  }
};
