const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Apri la connessione al database
async function openDb() {
  return open({
    filename: './database/database.sqlite',
    driver: sqlite3.Database
  });
}

// Inizializza il database
async function initializeDatabase() {
  const db = await openDb();
  
  // Crea la tabella per le impostazioni dei server
  await db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      generator_channel_id TEXT,
      category_id TEXT,
      channel_name_template TEXT DEFAULT '🔊 Stanza di {username}',
      max_channels INTEGER DEFAULT 10,
      control_channel_id TEXT,
      default_user_limit INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Crea la tabella per le sottoscrizioni
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT UNIQUE,
      plan_type TEXT DEFAULT 'free',
      status TEXT DEFAULT 'active',
      expiry_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guild_id) REFERENCES guild_settings (guild_id)
    )
  `);
  
  // Crea la tabella per le stanze temporanee con limiti utenti
  await db.exec(`
    CREATE TABLE IF NOT EXISTS temporary_channels (
      channel_id TEXT PRIMARY KEY,
      guild_id TEXT,
      owner_id TEXT,
      user_limit INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guild_id) REFERENCES guild_settings (guild_id)
    )
  `);
  
  await db.close();
}

// Ottieni le impostazioni per un server
async function getGuildSettings(guildId) {
  const db = await openDb();
  const settings = await db.get('SELECT * FROM guild_settings WHERE guild_id = ?', guildId);
  await db.close();
  return settings;
}

// Aggiorna o crea le impostazioni per un server
async function setGuildSettings(guildId, settings) {
  const db = await openDb();
  
  // Controlla se esistono già impostazioni per questo server
  const existing = await db.get('SELECT guild_id FROM guild_settings WHERE guild_id = ?', guildId);
  
  if (existing) {
    // Aggiorna le impostazioni esistenti
    await db.run(`
      UPDATE guild_settings 
      SET generator_channel_id = ?, category_id = ?, channel_name_template = ?, max_channels = ?, control_channel_id = ?, default_user_limit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE guild_id = ?
    `, [
      settings.generator_channel_id,
      settings.category_id,
      settings.channel_name_template,
      settings.max_channels,
      settings.control_channel_id,
      settings.default_user_limit,
      guildId
    ]);
  } else {
    // Crea nuove impostazioni
    await db.run(`
      INSERT INTO guild_settings (guild_id, generator_channel_id, category_id, channel_name_template, max_channels, control_channel_id, default_user_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      guildId,
      settings.generator_channel_id,
      settings.category_id,
      settings.channel_name_template,
      settings.max_channels,
      settings.control_channel_id,
      settings.default_user_limit
    ]);
  }
  
  await db.close();
  return await getGuildSettings(guildId);
}

// Imposta il limite utenti per un canale temporaneo
async function setChannelUserLimit(channelId, userLimit) {
  const db = await openDb();
  await db.run(`
    UPDATE temporary_channels 
    SET user_limit = ?
    WHERE channel_id = ?
  `, [userLimit, channelId]);
  await db.close();
}

// Aggiungi un canale temporaneo al database
async function addTemporaryChannel(channelId, guildId, ownerId, userLimit = 0) {
  const db = await openDb();
  await db.run(`
    INSERT OR REPLACE INTO temporary_channels (channel_id, guild_id, owner_id, user_limit)
    VALUES (?, ?, ?, ?)
  `, [channelId, guildId, ownerId, userLimit]);
  await db.close();
}

// Rimuovi un canale temporaneo dal database
async function removeTemporaryChannel(channelId) {
  const db = await openDb();
  await db.run('DELETE FROM temporary_channels WHERE channel_id = ?', channelId);
  await db.close();
}

// Ottieni le informazioni di un canale temporaneo
async function getTemporaryChannel(channelId) {
  const db = await openDb();
  const channel = await db.get('SELECT * FROM temporary_channels WHERE channel_id = ?', channelId);
  await db.close();
  return channel;
}

// Ottieni la sottoscrizione per un server
async function getSubscription(guildId) {
  const db = await openDb();
  const subscription = await db.get('SELECT * FROM subscriptions WHERE guild_id = ?', guildId);
  await db.close();
  return subscription;
}

// Aggiorna o crea una sottoscrizione per un server
async function setSubscription(guildId, subscriptionData) {
  const db = await openDb();
  
  // Controlla se esiste già una sottoscrizione per questo server
  const existing = await db.get('SELECT guild_id FROM subscriptions WHERE guild_id = ?', guildId);
  
  if (existing) {
    // Aggiorna la sottoscrizione esistente
    await db.run(`
      UPDATE subscriptions 
      SET plan_type = ?, status = ?, expiry_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE guild_id = ?
    `, [
      subscriptionData.plan_type,
      subscriptionData.status,
      subscriptionData.expiry_date,
      guildId
    ]);
  } else {
    // Crea una nuova sottoscrizione
    await db.run(`
      INSERT INTO subscriptions (guild_id, plan_type, status, expiry_date)
      VALUES (?, ?, ?, ?)
    `, [
      guildId,
      subscriptionData.plan_type || 'free',
      subscriptionData.status || 'active',
      subscriptionData.expiry_date
    ]);
  }
  
  await db.close();
  return await getSubscription(guildId);
}

module.exports = {
  initializeDatabase,
  getGuildSettings,
  setGuildSettings,
  setChannelUserLimit,
  addTemporaryChannel,
  removeTemporaryChannel,
  getTemporaryChannel,
  getSubscription,
  setSubscription
};
