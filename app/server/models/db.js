const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const path = require('path');
const fs = require('fs');

let db = null;

async function ensureOrderSessionColumns(database) {
  const columns = await database.all(`PRAGMA table_info(order_sessions)`);
  const columnNames = new Set(columns.map(column => column.name));

  if (!columnNames.has('max_food_items')) {
    await database.exec('ALTER TABLE order_sessions ADD COLUMN max_food_items INTEGER NOT NULL DEFAULT 2');
  }

  if (!columnNames.has('max_drink_items')) {
    await database.exec('ALTER TABLE order_sessions ADD COLUMN max_drink_items INTEGER NOT NULL DEFAULT 1');
  }
}

async function initializeDatabase() {
  const dbPath = process.env.APP_DB_PATH
    ? path.resolve(process.env.APP_DB_PATH)
    : path.join(__dirname, '..', '..', 'data', 'app.db');
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');

  // Initialize tables from schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Split schema into individual statements and execute
  const statements = schema.split(';').filter(stmt => stmt.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      await db.exec(stmt);
    }
  }

  await ensureOrderSessionColumns(db);

  console.log('Database initialized at:', dbPath);
  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};
