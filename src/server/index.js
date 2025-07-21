// src/server/index.js
const express = require('express');
const path    = require('path');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const initDb  = require('./db');    // now returns a mysql2 Pool
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY';

async function start() {
  const pool = await initDb;       // this is your mysql2 Pool

  const app = express();
  app.use(express.json());

  // --- Public test route ---
  app.get('/api/hello', async (req, res, next) => {
    try {
      const [rows] = await pool.query('SELECT message FROM greeting LIMIT 1');
      res.json({ message: rows[0]?.message ?? 'no greeting yet' });
    } catch (err) {
      next(err);
    }
  });

  // --- Register ---
  app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password required' });
    }
    try {
      const hash = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO `user` (name, email, password) VALUES (?, ?, ?)',
        [name, email, hash]
      );
      const userId = result.insertId;
      const token  = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: userId, name, email } });
    } catch (err) {
      // duplicate email?
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already in use' });
      }
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

    // --- Inventory list ---
  app.get('/api/inventory', requireAuth, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          bg.name    AS blood_group,
          i.total_ml AS total_ml
        FROM inventory i
        JOIN blood_group bg ON bg.id = i.blood_group_id
        ORDER BY bg.name;
      `);
      res.json({ inventory: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  // --- Login ---
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    try {
      const [rows] = await pool.query('SELECT * FROM `user` WHERE email = ?', [email]);
      const user = rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // --- Auth middleware ---
  function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;  // { id, email, iat, exp }
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // --- Protected profile route ---
  app.get('/api/profile', requireAuth, async (req, res) => {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM `user` WHERE id = ?',
      [req.user.id]
    );
    res.json({ user: rows[0] });
  });

  // --- Static & catch-all for React ---
  app.use(express.static(path.join(__dirname, '../../public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}



start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
