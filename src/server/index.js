// src/server/index.js
const express = require('express');
const path    = require('path');
const initDb  = require('./db');   // this is a Promise<Database>

async function start() {
  const db = await initDb;

  const app = express();
  app.use(express.json());

  app.get('/api/hello', async (req, res, next) => {
    try {
      const row = await db.get('SELECT message FROM greeting LIMIT 1');
      res.json({ message: row?.message ?? 'no greeting yet' });
    } catch (err) {
      next(err);
    }
  });

  // serve your React build / static assets
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
