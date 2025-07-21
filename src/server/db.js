// src/server/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function init() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_NAME) throw new Error('Missing DB_NAME in environment');

  // 1) Create the pool (allow multipleStatements)
  const pool = mysql.createPool({
    host: DB_HOST     || 'localhost',
    port: Number(DB_PORT) || 3306,
    user: DB_USER     || 'root',
    password: DB_PASSWORD || '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });

  // 2) Quick smoke-test
  await pool.query('SELECT 1');

  // 3) Run all your DDL at once
  await pool.query(`
    SET FOREIGN_KEY_CHECKS = 0;

    CREATE TABLE IF NOT EXISTS blood_group (
      id   INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(5) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS donor (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      first_name     VARCHAR(100) NOT NULL,
      last_name      VARCHAR(100) NOT NULL,
      date_of_birth  DATE         NOT NULL,
      gender         VARCHAR(10)  NOT NULL,
      blood_group_id INT          NOT NULL,
      phone          VARCHAR(20),
      email          VARCHAR(100),
      address        TEXT,
      FOREIGN KEY (blood_group_id) REFERENCES blood_group(id)
    );

    CREATE TABLE IF NOT EXISTS donation (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      donor_id    INT NOT NULL,
      donated_on  DATE NOT NULL,
      quantity_ml INT NOT NULL,
      status      VARCHAR(20) NOT NULL,
      FOREIGN KEY (donor_id) REFERENCES donor(id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      blood_group_id INT PRIMARY KEY,
      total_ml       INT NOT NULL DEFAULT 0,
      FOREIGN KEY (blood_group_id) REFERENCES blood_group(id)
    );

    CREATE TABLE IF NOT EXISTS \`request\` (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      patient_name   VARCHAR(200) NOT NULL,
      blood_group_id INT          NOT NULL,
      requested_ml   INT          NOT NULL,
      hospital       VARCHAR(200),
      requested_on   DATE         NOT NULL,
      status         VARCHAR(20)  NOT NULL,
      FOREIGN KEY (blood_group_id) REFERENCES blood_group(id)
    );

    CREATE TABLE IF NOT EXISTS transfusion (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      donation_id   INT NOT NULL,
      request_id    INT NOT NULL,
      transfused_on DATE NOT NULL,
      FOREIGN KEY (donation_id) REFERENCES donation(id),
      FOREIGN KEY (request_id)  REFERENCES \`request\`(id)
    );

    CREATE TABLE IF NOT EXISTS \`user\` (
      id       INT AUTO_INCREMENT PRIMARY KEY,
      name     VARCHAR(100) NOT NULL,
      email    VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );

    SET FOREIGN_KEY_CHECKS = 1;
  `);

  // 4) Seed blood_group & inventory if empty
  const bloodGroups = ['A+', 'A–', 'B+', 'B–', 'AB+', 'AB–', 'O+', 'O–'];
  for (const name of bloodGroups) {
    await pool.query(`INSERT IGNORE INTO blood_group (name) VALUES (?)`, [name]);
    await pool.query(`
      INSERT IGNORE INTO inventory (blood_group_id, total_ml)
      SELECT id, 0 FROM blood_group WHERE name = ?
    `, [name]);
  }

  console.log('✔️  MySQL database initialized');
  return pool;
}

module.exports = init();
