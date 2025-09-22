import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0,
});

// Ensure base tables exist
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      display_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

ensureSchema().catch((e) => {
  console.error('Erro ao preparar o schema do banco:', e);
});

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


// Register User
app.post('/api/register', async (req, res) => {
  const { displayName, email, password } = req.body;
  if (!displayName || !email || !password) {
    return res.status(400).json({ error: 'displayName, email e password são obrigatórios' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (display_name, email, password) VALUES (?, ?, ?)',
      [displayName, email, password]
    );
    res.status(201).json({ id: result.insertId, displayName, email });
  } catch (e) {
    // Duplicated email error
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    res.status(500).json({ error: e.message });
  }
});


app.post('/api/posts/create', async (req, res) => {})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Guaraná ouvido em http://localhost:${PORT}`);
});