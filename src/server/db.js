// src/server/db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function init() {
  // 1. Ensure the data folder exists
  const dbPath = path.join(__dirname, '../../data/database.sqlite');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 2. Open the database (creates file if it doesn't exist)
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // 3. Create Blood-Bank tables
  await db.exec(`
    PRAGMA foreign_keys = ON;

    -- Reference data for blood groups
    CREATE TABLE IF NOT EXISTS blood_group (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT NOT NULL UNIQUE    -- e.g. 'A+', 'O–', etc.
    );

    -- Donor records
    CREATE TABLE IF NOT EXISTS donor (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name     TEXT NOT NULL,
      last_name      TEXT NOT NULL,
      date_of_birth  TEXT NOT NULL,     -- ISO date string
      gender         TEXT NOT NULL,
      blood_group_id INTEGER NOT NULL,
      phone          TEXT,
      email          TEXT,
      address        TEXT,
      FOREIGN KEY(blood_group_id) REFERENCES blood_group(id)
    );

    -- Every time a donor gives blood
    CREATE TABLE IF NOT EXISTS donation (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id       INTEGER NOT NULL,
      donated_on     TEXT NOT NULL,     -- ISO date string
      quantity_ml    INTEGER NOT NULL,
      status         TEXT NOT NULL,     -- e.g. 'available', 'used', 'expired'
      FOREIGN KEY(donor_id) REFERENCES donor(id)
    );

    -- Current inventory per blood group
    CREATE TABLE IF NOT EXISTS inventory (
      blood_group_id INTEGER PRIMARY KEY,
      total_ml       INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(blood_group_id) REFERENCES blood_group(id)
    );

    -- Requests for transfusion
    CREATE TABLE IF NOT EXISTS request (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name   TEXT NOT NULL,
      blood_group_id INTEGER NOT NULL,
      requested_ml   INTEGER NOT NULL,
      hospital       TEXT,
      requested_on   TEXT NOT NULL,
      status         TEXT NOT NULL,    -- e.g. 'pending', 'fulfilled', 'cancelled'
      FOREIGN KEY(blood_group_id) REFERENCES blood_group(id)
    );

    -- When blood is actually transfused
    CREATE TABLE IF NOT EXISTS transfusion (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      donation_id   INTEGER NOT NULL,
      request_id    INTEGER NOT NULL,
      transfused_on TEXT NOT NULL,
      FOREIGN KEY(donation_id) REFERENCES donation(id),
      FOREIGN KEY(request_id)  REFERENCES request(id)
    );
  `);

  // 4. Seed blood_group and inventory if empty
  const groups = ['A+', 'A–', 'B+', 'B–', 'AB+', 'AB–', 'O+', 'O–'];
  for (const name of groups) {
    await db.run(
      `INSERT OR IGNORE INTO blood_group (name) VALUES (?)`,
      name
    );
    await db.run(
      `INSERT OR IGNORE INTO inventory (blood_group_id, total_ml)
       VALUES ((SELECT id FROM blood_group WHERE name = ?), 0)`,
      name
    );
  }

  return db;
}

module.exports = init();
