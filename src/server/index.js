// src/server/index.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const initDb = require('./db');    // returns a mysql2 Pool
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY';

async function start() {
  const pool = await initDb;
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
    const {
      name,
      email,
      password,
      gender,
      phone,
      address,
      role,
      blood_group   // ← include blood_group here
    } = req.body;

    // ensure all fields present
    if (
      !name ||
      !email ||
      !password ||
      !gender ||
      !phone ||
      !address ||
      !role ||
      !blood_group   // ← check blood_group as well
    ) {
      return res.status(400).json({
        error:
          'All fields (name, email, password, gender, phone, address, role, blood_group) are required.'
      });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        `INSERT INTO \`user\`
         (name, email, password, gender, phone, address, role, blood_group)
       VALUES (?,    ?,     ?,        ?,      ?,     ?,       ?,    ?)`,
        [name, email, hash, gender, phone, address, role, blood_group]
      );

      const userId = result.insertId;
      const token = jwt.sign(
        { id: userId, email, role, blood_group },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        token,
        user: { id: userId, name, email, gender, phone, address, role, blood_group }
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already in use' });
      }
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
      const [rows] = await pool.query(
        'SELECT id, name, email, role, password FROM `user` WHERE email = ?',
        [email]
      );
      const user = rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
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
      req.user = payload;  // { id, email, role, iat, exp }
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // --- Protected profile route ---
  app.get('/api/profile', requireAuth, async (req, res) => {
    const [rows] = await pool.query(
      'SELECT id, name, email, gender, phone, address, role FROM `user` WHERE id = ?',
      [req.user.id]
    );
    res.json({ user: rows[0] });
  });

  // --- Inventory list ---
  app.get('/api/inventory', requireAuth, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT bg.name  AS blood_group,
               i.total_ml
          FROM inventory i
     LEFT JOIN blood_group bg ON bg.id = i.blood_group_id
      ORDER BY bg.name
      `);
      res.json({ inventory: rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // --- User Dashboard APIs ---

  // 1) Upcoming Appointment
  app.get('/api/appointments/upcoming', requireAuth, async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, date, time, location
           FROM appointment
          WHERE user_id = ? AND date >= CURDATE()
          ORDER BY date ASC
          LIMIT 1`,
        [req.user.id]
      );
      res.json({ appointment: rows[0] || null });
    } catch (err) {
      next(err);
    }
  });

  // 2) Outstanding Reminders
  app.get('/api/reminders', requireAuth, async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, message, date
           FROM reminder
          WHERE user_id = ? AND date >= CURDATE()
          ORDER BY date ASC`,
        [req.user.id]
      );
      res.json({ reminders: rows });
    } catch (err) {
      next(err);
    }
  });

  // 3) Recent Activity (Donation History)
  app.get('/api/activity', requireAuth, async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        `SELECT id,
                CONCAT(quantity_ml, 'ml – ', status) AS description,
                donated_on AS date
           FROM donation
          WHERE donor_id = ?
          ORDER BY donated_on DESC
          LIMIT 5`,
        [req.user.id]
      );
      res.json({ activity: rows });
    } catch (err) {
      next(err);
    }
  });

  // 4) Eligibility Check (>=56 days since last donation)
  app.get('/api/eligibility', requireAuth, async (req, res, next) => {
    try {
      const [rows] = await pool.query(
        `SELECT donated_on
           FROM donation
          WHERE donor_id = ?
          ORDER BY donated_on DESC
          LIMIT 1`,
        [req.user.id]
      );
      let eligible = true;
      if (rows[0]) {
        const lastDate = new Date(rows[0].donated_on);
        const diffDays = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        eligible = diffDays >= 56;
      }
      res.json({ eligible });
    } catch (err) {
      next(err);
    }
  });

  // --- GET profile + eligibility + tips ---
  app.get('/api/profile', requireAuth, async (req, res, next) => {
    try {
      // 1) Get the user’s stored profile
      const [users] = await pool.query(
        `SELECT id, name, email, gender, phone, address, role, blood_group
         FROM \`user\`
        WHERE id = ?`,
        [req.user.id]
      );
      if (!users[0]) return res.status(404).json({ error: 'Not found' });
      const user = users[0];

      // 2) Next-eligible date (56 days after last donation)
      const [donations] = await pool.query(
        `SELECT donated_on
         FROM donation
        WHERE donor_id = ?
        ORDER BY donated_on DESC
        LIMIT 1`,
        [req.user.id]
      );
      let nextEligibleDate = new Date();
      if (donations[0]) {
        const last = new Date(donations[0].donated_on);
        nextEligibleDate = new Date(last.getTime() + 56 * 24 * 60 * 60 * 1000);
      }

      // 3) Health tips (could be from a DB table; here static)
      const healthTips = [
        'Stay hydrated 24 hours before donation.',
        'Eat a healthy meal 2–3 hours before.',
        'Avoid fatty foods on donation day.'
      ];

      res.json({
        user,
        eligibility: {
          nextEligibleDate: nextEligibleDate.toISOString().slice(0, 10),
          healthTips
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // --- PUT update profile ---
  app.put('/api/profile', requireAuth, async (req, res) => {
    const { name, gender, phone, address, blood_group } = req.body;
    if (!name || !gender || !phone || !address || !blood_group) {
      return res
        .status(400)
        .json({ error: 'name, gender, phone, address, blood_group are required' });
    }
    try {
      await pool.query(
        `UPDATE \`user\`
          SET name        = ?,
              gender      = ?,
              phone       = ?,
              address     = ?,
              blood_group = ?
        WHERE id = ?`,
        [name, gender, phone, address, blood_group, req.user.id]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // --- Donation History: paginated, with filters ---
app.get('/api/donations', requireAuth, async (req, res, next) => {
  try {
    const userId   = req.user.id;
    const {
      page   = 1,
      pageSize = 10,
      year,
      center,
      status
    } = req.query;

    // Build WHERE clause
    const where = ['donor_id = ?'];
    const params = [userId];

    if (year) {
      where.push('YEAR(donated_on) = ?');
      params.push(year);
    }
    if (center) {
      where.push('center = ?');
      params.push(center);
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    // Count total
    const countSql = `
      SELECT COUNT(*) AS total
        FROM donation
       WHERE ${where.join(' AND ')}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    // Pagination
    const limit  = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;
    params.push(limit, offset);

    // Fetch page
    const sql = `
      SELECT 
        id,
        donated_on   AS date,
        center,
        quantity_ml  AS volume,
        status
      FROM donation
      WHERE ${where.join(' AND ')}
      ORDER BY donated_on DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, params);

    res.json({
      donations: rows,
      pagination: {
        total,
        page:   parseInt(page, 10),
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// --- FAQs (static) ---
const faqs = [
  { q: 'Who can donate blood?', 
    a: 'Anyone aged 18–65 in good health, weighing at least 50kg...' },
  { q: 'How often can I donate?', 
    a: 'Every 56 days for whole blood; 112 days for double red cell donations.' },
  { q: 'What should I eat before donating?', 
    a: 'A balanced meal 2–4 hours beforehand; avoid fatty foods.' },
  { q: 'Are there side effects?', 
    a: 'Minor bruising, dizziness—most resolve within 24 hours.' },
  // …add more as needed…
];

app.get('/api/faqs', (req, res) => {
  res.json({ faqs });
});

// --- Submit Support Query ---
app.post('/api/support-query', requireAuth, async (req, res) => {
  const { type, subject, message } = req.body;
  if (!type || !subject || !message) {
    return res.status(400).json({ error: 'type, subject & message are required' });
  }
  if (!['Medical','Technical'].includes(type)) {
    return res.status(400).json({ error: 'Invalid query type' });
  }
  try {
    const userId = req.user.id;
    await pool.query(
      `INSERT INTO support_query (user_id, type, subject, message)
         VALUES (?, ?, ?, ?)`,
      [userId, type, subject, message]
    );
    res.json({ success: true, message: 'Your query has been submitted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   POST /api/donations
 * @desc    Record a new donation by the logged-in user
 * @access  Protected
 */
app.post('/api/donations', requireAuth, async (req, res) => {
  const { donated_on, center, quantity_ml, status } = req.body;
  if (!donated_on || !center || !quantity_ml || !status) {
    return res.status(400).json({ error: 'donated_on, center, quantity_ml and status are required.' });
  }
  try {
    // Insert into donation table
    const [result] = await pool.query(
      `INSERT INTO donation (donor_id, donated_on, center, quantity_ml, status)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, donated_on, center, quantity_ml, status]
    );

    // Optionally update inventory if you track by blood group:
    // const [userRow] = await pool.query(
    //   'SELECT blood_group FROM `user` WHERE id = ?', [req.user.id]
    // );
    // const [[ bg ]] = await pool.query(
    //   'SELECT id FROM blood_group WHERE name = ?', [userRow[0].blood_group]
    // );
    // await pool.query(
    //   `UPDATE inventory
    //     SET total_ml = total_ml + ?
    //    WHERE blood_group_id = ?`,
    //   [quantity_ml, bg.id]
    // );

    res.status(201).json({
      id:     result.insertId,
      donated_on,
      center,
      quantity_ml,
      status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * @route   POST /api/request
 * @desc    Create a new blood request
 * @access  Protected
 */
app.post('/api/request', requireAuth, async (req, res) => {
  const { patient_name, blood_group, requested_ml, hospital, requested_on, status } = req.body;
  if (!patient_name || !blood_group || !requested_ml || !requested_on || !status) {
    return res.status(400).json({ error: 'patient_name, blood_group, requested_ml, requested_on and status are required.' });
  }
  try {
    // Look up blood_group_id from name
    const [bgRows] = await pool.query(
      'SELECT id FROM blood_group WHERE name = ?',
      [blood_group]
    );
    if (!bgRows.length) {
      return res.status(400).json({ error: 'Invalid blood_group' });
    }
    const bgId = bgRows[0].id;

    const [result] = await pool.query(
      `INSERT INTO request
         (patient_name, blood_group_id, requested_ml, hospital, requested_on, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_name, bgId, requested_ml, hospital, requested_on, status]
    );

    res.status(201).json({
      id:            result.insertId,
      patient_name,
      blood_group,
      requested_ml,
      hospital,
      requested_on,
      status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
