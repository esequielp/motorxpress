import { Router } from 'express';
import db from './db';

const router = Router();

// =====================================
// AUTH & USERS
// =====================================

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?').get(email, password);
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
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, password, role || 'customer');
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body; // usually password updated separately
  try {
    db.prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?').run(name, email, role, id);
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
    `).all();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Admin: add product
router.post('/products', (req, res) => {
  const { sku, name, vehicle, price, stock, maxStock, image, category_id, brand_id } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO products (sku, name, vehicle, price, stock, maxStock, image, category_id, brand_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(sku, name, vehicle, price, stock, maxStock || stock, image, category_id, brand_id);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: update product
router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { sku, name, vehicle, price, stock, maxStock, image, category_id, brand_id } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET sku = ?, name = ?, vehicle = ?, price = ?, stock = ?, maxStock = ?, image = ?, category_id = ?, brand_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(sku, name, vehicle, price, stock, maxStock, image, category_id, brand_id, id);
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
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
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
      const info = orderStmt.run(user_id || null, customer_name, customer_email, customer_phone, shipping_address, total);
      const orderId = info.lastInsertRowid;
      
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const item of items) {
        itemStmt.run(orderId, item.product_id || item.id, item.name, item.price, item.quantity);
        if (item.product_id || item.id) {
          updateStockStmt.run(item.quantity, item.product_id || item.id);
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

export default router;
