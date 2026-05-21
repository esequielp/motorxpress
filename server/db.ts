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
      phone TEXT,
      address TEXT,
      birthdate TEXT,
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
      cost INTEGER DEFAULT 0,
      stock INTEGER NOT NULL,
      maxStock INTEGER DEFAULT 0,
      image TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
      cross_sell_ids TEXT,
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

    CREATE TABLE IF NOT EXISTS pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate existing tables
  try {
    db.exec(`ALTER TABLE products ADD COLUMN type TEXT DEFAULT 'simple';`);
  } catch (err: any) {}
  try {
    db.exec(`ALTER TABLE products ADD COLUMN variations TEXT;`);
  } catch (err: any) {}
  try {
    db.exec(`ALTER TABLE products ADD COLUMN combo_items TEXT;`);
  } catch (err: any) {}
  try {
    db.exec(`ALTER TABLE products ADD COLUMN cross_sell_ids TEXT;`);
  } catch (err: any) {
    // Ignore error if column already exists
  }
  try {
    db.exec(`ALTER TABLE users ADD COLUMN phone TEXT;`);
  } catch (err: any) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN address TEXT;`);
  } catch (err: any) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN addresses TEXT;`); // Store JSON string of addresses
  } catch (err: any) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN birthdate TEXT;`);
  } catch (err: any) {}

  // Seed pages if empty
  const countPagesStmt = db.prepare('SELECT COUNT(*) as count FROM pages').get() as { count: number };
  if (countPagesStmt.count === 0) {
    const insertPage = db.prepare('INSERT INTO pages (slug, title, content) VALUES (?, ?, ?)');
    insertPage.run('retornos', 'Políticas de Devolución', '<h2>Políticas de Devolución</h2>\n<p>Aceptamos devoluciones dentro de los primeros 30 días tras su compra, siempre y cuando el producto se encuentre sellado y en su empaque original.</p>\n<p>Si el producto presenta fallas de fábrica, por favor diríjase a la sección de garantías.</p>');
    insertPage.run('faq', 'Preguntas Frecuentes', '<h2>Preguntas Frecuentes</h2>\n<ul>\n<li><strong>¿Hacen envíos a todo Chile?</strong><br>Sí, enviamos a todas las regiones mediante Chilexpress o Starken.</li>\n<li><strong>¿Cómo puedo rastrear mi pedido?</strong><br>Una vez despachado, le enviaremos el número de seguimiento por correo.</li>\n<li><strong>¿Venden repuestos originales?</strong><br>Todos nuestros productos son repuestos de calidad y marcas certificadas.</li>\n</ul>');
    insertPage.run('envios', 'Tiempos de Envío', '<h2>Tiempos de Envío</h2>\n<p>Los pedidos se procesan en 24 a 48 horas hábiles tras la confirmación de pago.</p>\n<ul>\n<li>Región Metropolitana: 1-3 días hábiles.</li>\n<li>Otras regiones: 3-7 días hábiles dependiendo de la localidad.</li>\n</ul>');
    insertPage.run('terminos', 'Términos y Condiciones', '<h2>Términos y Condiciones</h2>\n<p>El uso de este sitio web y la compra de productos a través de él están sujetos a nuestros términos y condiciones comerciales. Cuidamos su experiencia de compra y garantizamos la seguridad de sus pagos vía Webpay / Flow.</p>');
    insertPage.run('privacidad', 'Política de Privacidad', '<h2>Política de Privacidad</h2>\n<p>Su información personal (nombre, correo electrónico, dirección) solo es utilizada para gestionar sus compras y enviar comunicaciones relacionadas con sus pedidos o promociones, en caso de haberlo autorizado explícitamente.</p>');
    insertPage.run('quienes-somos', 'Quiénes Somos', '<h2>Quiénes Somos</h2>\n<p>Somos MotorXPress, una tienda líder en repuestos automotrices con años de experiencia en el mercado. Nuestro objetivo es llevar hasta la puerta de su casa u taller los mejores repuestos al mejor precio.</p>');
    insertPage.run('garantia', 'Política de Garantía', '<h2>Política de Garantía</h2>\n<p>Todos nuestros productos cuentan con garantía legal de 6 meses (garantía 3x3) ante fallas o defectos de fabricación. Esto no cubre daños por mala instalación o desgaste normal del producto.</p>');
  }

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
    INSERT INTO products (sku, mpn, name, vehicle, price, cost, stock, maxStock, image, category_id, brand_id, is_featured, is_offer, is_new, offer_price, description, type, variations, combo_items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const prod1Id = insertProduct.run(
    'MX-FLT-001', 'FLT-TOY-001', 'KIT FILTROS TOYOTA COROLLA 1.6', 'Toyota Corolla 2005-2012 Sedán',
    18990, 10000, 5, 5, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
    catIds.filtros, brandIds.toyota, 1, 0, 0, null, 'Filtro de aire, aceite y cabina de alta retención de partículas.', 'simple', null, null
  ).lastInsertRowid;

  const prod2Id = insertProduct.run(
    'MX-BUJ-002', 'BUJ-IRI-002', 'BUJIAS IRIDIUM TOYOTA COROLLA', 'Toyota Corolla 2005-2012 Sedán',
    12500, 5000, 12, 12, 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=400&q=80',
    catIds.bujias, brandIds.toyota, 0, 1, 0, 8500, 'Bujías de Iridium con electrodo central ultra fino.', 'simple', null, null
  ).lastInsertRowid;

  insertProduct.run(
    'MX-PST-003', 'PST-CER-003', 'PASTILLAS DE FRENO CERÁMICAS', 'Universal',
    32900, 15000, 2, 2, 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=400&q=80',
    catIds.frenos, brandIds.universal, 1, 0, 1, null, 'Compuesto cerámico avanzado.', 'simple', null, null
  );

  insertProduct.run(
    'MX-ACE-004', 'ACE-5W30-004', 'ACEITE SINTÉTICO 5W30 4L', 'Universal',
    26500, 12000, 20, 20, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80',
    catIds.aceite, brandIds.universal, 0, 0, 1, null, 'Lubricante 100% sintético.', 'simple', null, null
  );

  // Producto con variaciones (Casco)
  insertProduct.run(
    'MX-CAS-005', 'CAS-MOTO-005', 'CASCO MOTO PREMIUM', 'Universal',
    85000, 40000, 0, 0, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
    null, brandIds.universal, 1, 0, 1, null, 'Casco integral con certificación DOT.', 
    'variable', 
    JSON.stringify([
      { id: 'v1', sku: 'MX-CAS-005-M-N', name: 'Talla M - Negro', price: 85000, stock: 5, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80' },
      { id: 'v2', sku: 'MX-CAS-005-L-N', name: 'Talla L - Negro', price: 85000, stock: 3, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80' },
      { id: 'v3', sku: 'MX-CAS-005-M-B', name: 'Talla M - Blanco', price: 85000, stock: 2, image: 'https://images.unsplash.com/photo-1508355655-32e604f32acc?auto=format&fit=crop&w=400&q=80' }
    ]), 
    null
  );

  // Producto en combo
  insertProduct.run(
    'MX-CMB-006', 'CMB-MANT-006', 'COMBO MANTENIMIENTO TOYOTA', 'Toyota Corolla 2005-2012 Sedán',
    28000, 15000, 10, 10, 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&q=80',
    null, brandIds.toyota, 1, 1, 1, 24990, 'El combo perfecto para el mantenimiento de tu Toyota.', 
    'combo', 
    null, 
    JSON.stringify([
      { product_id: prod1Id, quantity: 1 },
      { product_id: prod2Id, quantity: 4 }
    ])
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
