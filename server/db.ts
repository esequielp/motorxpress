import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use /tmp/database.sqlite if running in a read-only environment without explicit volume,
// but since this gives persistence, let's just use the local dir.
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      mpn TEXT,
      name TEXT NOT NULL,
      vehicle TEXT NOT NULL,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      maxStock INTEGER DEFAULT 0,
      image TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
      is_featured BOOLEAN DEFAULT 0,
      is_offer BOOLEAN DEFAULT 0,
      is_new BOOLEAN DEFAULT 0,
      offer_price INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
      total INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed data if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (countStmt.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const catIds: Record<string, number | bigint> = {
    filtros: insertCategory.run('Filtros').lastInsertRowid,
    bujias: insertCategory.run('Bujía').lastInsertRowid,
    frenos: insertCategory.run('Frenos').lastInsertRowid,
    aceite: insertCategory.run('Aceite').lastInsertRowid,
  };

  const insertBrand = db.prepare('INSERT INTO brands (name) VALUES (?)');
  const brandIds: Record<string, number | bigint> = {
    toyota: insertBrand.run('Toyota').lastInsertRowid,
    nissan: insertBrand.run('Nissan').lastInsertRowid,
    universal: insertBrand.run('Universal').lastInsertRowid,
  };

  const insertProduct = db.prepare(`
    INSERT INTO products (sku, mpn, name, vehicle, price, stock, maxStock, image, category_id, brand_id, is_featured, is_offer, is_new, offer_price, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    'MX-FLT-001', 'FLT-TOY-001', 'KIT FILTROS TOYOTA COROLLA 1.6', 'Toyota Corolla 2005-2012 Sedán',
    18990, 5, 5, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
    catIds.filtros, brandIds.toyota, 1, 0, 0, null, 'Filtro de aire, aceite y cabina de alta retención de partículas. Extiende la vida útil de tu motor garantizando un flujo limpio y constante. Dimensiones OEM.'
  );

  insertProduct.run(
    'MX-BUJ-002', 'BUJ-IRI-002', 'BUJIAS IRIDIUM TOYOTA COROLLA', 'Toyota Corolla 2005-2012 Sedán',
    12500, 12, 12, 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=400&q=80',
    catIds.bujias, brandIds.toyota, 0, 1, 0, 8500, 'Bujías de Iridium con electrodo central ultra fino (0.4mm). Proporciona mejor aceleración, ignición más rápida y ahorro de combustible de hasta un 5%.'
  );

  insertProduct.run(
    'MX-PST-003', 'PST-CER-003', 'PASTILLAS DE FRENO CERÁMICAS', 'Universal',
    32900, 2, 2, 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=400&q=80',
    catIds.frenos, brandIds.universal, 1, 0, 1, null, 'Compuesto cerámico avanzado que reduce el polvo en las llantas y ruidos ("chillidos") molestos durante el frenado continuo. Resistentes a altas temperaturas (hasta 600°C).'
  );

  insertProduct.run(
    'MX-ACE-004', 'ACE-5W30-004', 'ACEITE SINTÉTICO 5W30 4L', 'Universal',
    26500, 20, 20, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80',
    catIds.aceite, brandIds.universal, 0, 0, 1, null, 'Lubricante 100% sintético diseñado con aditivos anti-desgaste y dispersantes de hollín. Mantiene el motor limpio y protegido incluso en arranques en frío extremos.'
  );
  
  // Seed admin user and other users
  const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  const adminId = insertUser.run('Admin', 'admin@motorxpress.cl', 'admin123', 'admin').lastInsertRowid;
  const execId = insertUser.run('Ejecutivo Ventas', 'ejecutivo@motorxpress.cl', 'ejecutivo123', 'ejecutivo').lastInsertRowid;
  const cust1Id = insertUser.run('Juan Pérez', 'juan.perez@example.com', 'cliente123', 'customer').lastInsertRowid;
  const cust2Id = insertUser.run('María Silva', 'maria.silva@example.com', 'cliente123', 'customer').lastInsertRowid;

  // Seed mock orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, status, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertOrder.run(cust1Id, 'Juan Pérez', 'juan.perez@example.com', '+56912345678', 'Av. Providencia 123, Depto 4', 'shipped', 32480);
  insertOrder.run(cust2Id, 'María Silva', 'maria.silva@example.com', '+56987654321', 'Las Condes 555', 'pending', 18990);
  insertOrder.run(null, 'Invitado Test', 'invitado@test.com', '+56911111111', 'Santiago Centro 999', 'cancelled', 8500); // cancelled/rejected
  insertOrder.run(cust1Id, 'Juan Pérez', 'juan.perez@example.com', '+56912345678', 'Av. Providencia 123, Depto 4', 'paid', 26500);

  // Seed default settings
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('payment_method', 'flow');
  insertSetting.run('shipping_method', 'chilexpress');
}

export default db;
