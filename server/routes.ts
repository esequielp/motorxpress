import { Router } from 'express';
import db from './db';

const router = Router();

// =====================================
// AUTH & USERS
// =====================================

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT id, name, email, role, phone, address, addresses, birthdate FROM users WHERE email = ? AND password = ?').get(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, phone, address, addresses, birthdate, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', (req, res) => {
  const { name, email, password, role, phone, address, addresses, birthdate } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role, phone, address, addresses, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, email, password, role || 'customer', phone || null, address || null, addresses || null, birthdate || null);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role, phone, address, addresses, birthdate } = req.body;
  try {
    db.prepare('UPDATE users SET name = ?, email = ?, role = ?, phone = ?, address = ?, addresses = ?, birthdate = ? WHERE id = ?')
      .run(name, email, role, phone || null, address || null, addresses || null, birthdate || null, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// =====================================
// PRODUCTS
// =====================================

// Get all products
router.get('/products', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category, b.name as brandName 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
    `).all() as any[];
    
    const getLightProduct = db.prepare('SELECT id, name, price, stock, image FROM products WHERE id = ?');
    
    // Parse JSON fields
    products.forEach(p => {
      if (p.variations) p.variations = JSON.parse(p.variations);
      if (p.combo_items) {
        const parsed = JSON.parse(p.combo_items);
        p.combo_items = parsed.map((item: any) => {
           return { ...item, product: getLightProduct.get(item.product_id) };
        });
      };
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/products/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category, b.name as brandName 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `).get(req.params.id) as any;
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Parse JSON fields
    if (product.variations) product.variations = JSON.parse(product.variations);
    if (product.combo_items) {
      const getLightProduct = db.prepare('SELECT id, name, price, stock, image FROM products WHERE id = ?');
      const parsed = JSON.parse(product.combo_items);
      product.combo_items = parsed.map((item: any) => {
         return { ...item, product: getLightProduct.get(item.product_id) };
      });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin: add product
router.post('/products', (req, res) => {
  const { sku, mpn, name, vehicle, price, cost, stock, maxStock, image, category_id, brand_id, cross_sell_ids, is_featured, is_offer, is_new, offer_price, description, type, variations, combo_items } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO products (sku, mpn, name, vehicle, price, cost, stock, maxStock, image, category_id, brand_id, cross_sell_ids, is_featured, is_offer, is_new, offer_price, description, type, variations, combo_items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(sku, mpn || null, name, vehicle, price, cost || 0, stock, maxStock || stock, image, category_id, brand_id, cross_sell_ids || null, is_featured ? 1 : 0, is_offer ? 1 : 0, is_new ? 1 : 0, offer_price || null, description || null, type || 'simple', variations ? JSON.stringify(variations) : null, combo_items ? JSON.stringify(combo_items) : null);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: update product
router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { sku, mpn, name, vehicle, price, cost, stock, maxStock, image, category_id, brand_id, cross_sell_ids, is_featured, is_offer, is_new, offer_price, description, type, variations, combo_items } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET sku = ?, mpn = ?, name = ?, vehicle = ?, price = ?, cost = ?, stock = ?, maxStock = ?, image = ?, category_id = ?, brand_id = ?, cross_sell_ids = ?, is_featured = ?, is_offer = ?, is_new = ?, offer_price = ?, description = ?, type = ?, variations = ?, combo_items = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(sku, mpn || null, name, vehicle, price, cost || 0, stock, maxStock, image, category_id, brand_id, cross_sell_ids || null, is_featured ? 1 : 0, is_offer ? 1 : 0, is_new ? 1 : 0, offer_price || null, description || null, type || 'simple', variations ? JSON.stringify(variations) : null, combo_items ? JSON.stringify(combo_items) : null, id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: delete product
router.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// =====================================
// CATEGORIES & BRANDS
// =====================================

router.get('/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories').all());
});

router.get('/brands', (req, res) => {
  res.json(db.prepare('SELECT * FROM brands').all());
});

// =====================================
// ORDERS
// =====================================

// Get all orders (Admin)
router.get('/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order with items
router.get('/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(req.params.id);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get orders for a specific user
router.get('/orders/user/:userId', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.params.userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Create order
router.post('/orders', (req, res) => {
  const { user_id, customer_name, customer_email, customer_phone, shipping_address, items, total } = req.body;
  try {
    const createOrder = db.transaction(() => {
      const orderStmt = db.prepare(`
        INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = orderStmt.run(user_id || null, customer_name || null, customer_email || null, customer_phone || null, shipping_address || null, total || 0);
      const orderId = info.lastInsertRowid;
      
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const item of items) {
        const pIdRaw = (item.product_id || item.id);
        const basePId = pIdRaw ? parseInt(pIdRaw.toString().split('-')[0], 10) : null;
        itemStmt.run(orderId, basePId || null, item.name || 'Producto', item.price || 0, item.quantity || 1);
        if (basePId) {
          updateStockStmt.run(item.quantity || 1, basePId);
        }
      }
      return orderId;
    });

    const newOrderId = createOrder();
    res.json({ success: true, orderId: newOrderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Admin: Update order status
router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// =====================================
// SETTINGS
// =====================================

router.get('/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all() as {key: string, value: string}[];
    const settingsObj = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', (req, res) => {
  const settings = req.body;
  try {
    const updateSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
    db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        updateSetting.run(key, String(value));
      }
    })();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// =====================================
// PAGES
// =====================================

router.get('/pages', (req, res) => {
  try {
    const pages = db.prepare('SELECT * FROM pages').all();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.get('/pages/:slug', (req, res) => {
  try {
    const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.put('/pages/:slug', (req, res) => {
  const { title, content } = req.body;
  const slug = req.params.slug;
  try {
    db.prepare('INSERT INTO pages (slug, title, content) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content=excluded.content, updated_at=CURRENT_TIMESTAMP').run(slug, title, content);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// =====================================
// NEWSLETTER
// =====================================

router.post('/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    db.prepare('INSERT INTO newsletters (email) VALUES (?)').run(email);
    res.json({ success: true, message: '¡Gracias por suscribirte a nuestro boletín!' });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message.includes('UNIQUE')) {
       return res.status(400).json({ error: 'Este correo ya está suscrito.' });
    }
    res.status(500).json({ error: 'Fallo al suscribir' });
  }
});

export default router;

