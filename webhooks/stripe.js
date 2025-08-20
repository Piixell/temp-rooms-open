const express = require('express');
const stripe = require('stripe');
const { setSubscription } = require('../database/db');
require('dotenv').config();

const app = express();

// Middleware per parsare il body delle richieste
app.use(express.raw({type: 'application/json'}));

// Endpoint per i webhook di Stripe
app.post('/webhook', async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // Verifica la firma del webhook
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Gestisci l'evento
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
      
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription);
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleSubscriptionDeleted(deletedSubscription);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  // Ritorna una risposta di successo a Stripe
  response.json({received: true});
});

// Gestisci il completamento di una sessione di checkout
async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  // Estrai il guildId dai metadati della sessione
  const guildId = session.metadata?.guild_id;
  
  if (!guildId) {
    console.log('No guild_id found in session metadata');
    return;
  }
  
  // Determina il tipo di piano dal prezzo
  let planType = 'basic'; // default
  if (session.amount_total >= 1000) { // 10€ o più
    planType = 'premium';
  }
  
  // Crea o aggiorna la sottoscrizione nel database
  await setSubscription(guildId, {
    plan_type: planType,
    status: 'active',
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 giorni da oggi
  });
  
  console.log(`Subscription activated for guild ${guildId} with plan ${planType}`);
}

// Gestisci l'aggiornamento di una sottoscrizione
async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Estrai il guildId dai metadati della sottoscrizione
  const guildId = subscription.metadata?.guild_id;
  
  if (!guildId) {
    console.log('No guild_id found in subscription metadata');
    return;
  }
  
  // Determina il tipo di piano
  let planType = 'basic';
  if (subscription.items.data.some(item => item.price.unit_amount >= 1000)) {
    planType = 'premium';
  }
  
  // Aggiorna la sottoscrizione nel database
  await setSubscription(guildId, {
    plan_type: planType,
    status: subscription.status,
    expiry_date: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
  });
  
  console.log(`Subscription updated for guild ${guildId} with plan ${planType} and status ${subscription.status}`);
}

// Gestisci la cancellazione di una sottoscrizione
async function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Estrai il guildId dai metadati della sottoscrizione
  const guildId = subscription.metadata?.guild_id;
  
  if (!guildId) {
    console.log('No guild_id found in subscription metadata');
    return;
  }
  
  // Imposta lo stato della sottoscrizione come scaduto
  await setSubscription(guildId, {
    plan_type: subscription.metadata?.plan_type || 'basic',
    status: 'expired',
    expiry_date: new Date()
  });
  
  console.log(`Subscription expired for guild ${guildId}`);
}

module.exports = app;
