// Simulazione di configurazione in memoria
let serverSettings = {
  generator_channel_id: process.env.GENERATOR_CHANNEL_ID || null,
  category_id: process.env.CATEGORY_ID || null,
  control_channel_id: process.env.CONTROL_CHANNEL_ID || null,
  channel_name_template: process.env.CHANNEL_NAME_TEMPLATE || '🔊 Stanza di {username}',
  default_user_limit: parseInt(process.env.DEFAULT_USER_LIMIT) || 0,
  max_channels: parseInt(process.env.MAX_CHANNELS) || 10
};

// Simulazione di sottoscrizione in memoria
let serverSubscription = {
  plan_type: 'free',
  status: 'active'
};

// Funzione per ottenere la sottoscrizione (simulazione)
function getSubscription(guildId) {
  return serverSubscription;
}

// Funzione per ottenere le impostazioni (simulazione)
function getGuildSettings() {
  return serverSettings;
}

// Middleware per verificare la sottoscrizione attiva
async function checkSubscription(req, res, next) {
  // Se è una richiesta Discord, controlliamo la sottoscrizione
  if (req.body && req.body.guild_id) {
    const guildId = req.body.guild_id;
    return await checkGuildSubscription(guildId, req, res, next);
  }
  
  // Per altre richieste, continuiamo normalmente
  next();
}

// Funzione per verificare la sottoscrizione di un server Discord
async function checkGuildSubscription(guildId, req, res, next) {
  const subscription = getSubscription(guildId);
  
  // Se non esiste una sottoscrizione, creiamo una di default (free)
  if (!subscription) {
    // Per ora permettiamo l'accesso di default con piano gratuito
    req.subscription = { plan_type: 'free', status: 'active' };
    next();
    return;
  }
  
  // Controlliamo che la sottoscrizione sia attiva
  if (subscription.status !== 'active') {
    return res.status(403).json({
      error: 'Subscription not active',
      message: 'Questo server non ha una sottoscrizione attiva. Usa /subscribe per informazioni.'
    });
  }
  
  req.subscription = subscription;
  next();
}

// Funzione per verificare i limiti del piano
async function checkPlanLimits(guildId, action) {
  const subscription = getSubscription(guildId);
  const settings = getGuildSettings();
  
  const plan = subscription ? subscription.plan_type : 'free';
  const maxChannels = settings ? settings.max_channels : (plan === 'free' ? 5 : plan === 'basic' ? 20 : 100);
  
  switch (action) {
    case 'create_channel':
      // Qui potremmo controllare quanti canali sono attivi
      // Per ora restituiamo i limiti del piano
      return {
        limit: maxChannels,
        plan: plan
      };
      
    default:
      return {
        limit: maxChannels,
        plan: plan
      };
  }
}

// Controllo specifico per le funzionalità premium
function checkPremiumFeature(guildId, feature) {
  const subscription = getSubscription(guildId);
  const plan = subscription ? subscription.plan_type : 'free';
  
  // Definiamo quali funzionalità sono premium
  const premiumFeatures = [
    'unlimited_channels',
    'advanced_customization',
    'priority_support'
  ];
  
  // Se la funzionalità è premium, controlliamo il piano
  if (premiumFeatures.includes(feature)) {
    if (plan === 'free') {
      return {
        allowed: false,
        message: 'Questa funzionalità è disponibile solo con un piano a pagamento. Usa /subscribe per effettuare l\'upgrade.'
      };
    }
  }
  
  return {
    allowed: true
  };
}

module.exports = {
  checkSubscription,
  checkGuildSubscription,
  checkPlanLimits,
  checkPremiumFeature
};
