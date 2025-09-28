import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 37844),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  queueLimit: 0,
});

// Ensure base tables exist
async function ensureSchema() {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Posts table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      post_id INT AUTO_INCREMENT PRIMARY KEY,
      post_tittle VARCHAR(255) NOT NULL,
      post_image TEXT,
      post_content TEXT NOT NULL,
      post_tags VARCHAR(500),
      userID INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_posts_user FOREIGN KEY (userID)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

ensureSchema().catch((e) => {
  console.error("Erro ao preparar o schema do banco:", e);
});

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// API index for diagnostics
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "TinyYellow API Server", base: "/api" });
});
app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    message: "Bem-vindo à API do TinyYellow",
    endpoints: [
      "GET /api",
      "GET /api/health",
      "GET /api/users/list",
      "GET /api/posts/list",
      "POST /api/register",
      "POST /api/posts/create",
    ],
  });
});
app.get("/api/", (_req, res) => {
  res.json({
    ok: true,
    message: "Bem-vindo à API do TinyYellow",
    endpoints: [
      "GET /api",
      "GET /api/health",
      "GET /api/users/list",
      "GET /api/posts/list",
      "POST /api/register",
      "POST /api/posts/create",
    ],
  });
});

// Register User
app.post("/api/register", async (req, res) => {
  const { displayName, email, password } = req.body;
  if (!displayName || !email || !password) {
    return res
      .status(400)
      .json({ error: "displayName, email e password são obrigatórios" });
  }
  try {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [displayName, email, password]
    );
    res.status(201).json({ id: result.insertId, displayName, email });
  } catch (e) {
    // Duplicated email error
    if (e && e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/users/list", async (_req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users");
    res.json(rows);
  } catch (e) {}
});

/*
app.post('/api/posts/create', async (req, res) => {
    const email = auth.currentUser.email;
    const [userID, field] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    console.log(userID)
    console.log(field)
    const { title, image, content, tags } = req.body;
    if (!title || !image || !content || !tags) {
        return res.status(400).json({error: 'Faltam dados para criar o post'});
    }
    try {
        const [userID] = await pool.execute(
            'INSERT INTO posts (post_tittle, post_image, post_content, post_tags, userID) VALUES (?, ?, ?, ?, ?)',
            [title, image, content, tags, userID]
        );
        res.status(201).json({ id: result.insertId, title, image, content, tags });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})
*/

// Método para criar um novo post
app.post("/api/posts/create", async (req, res) => {
  const { email, title, image, content, tags } = req.body;

  if (!email || !title || !image || !content || !tags) {
    return res.status(400).json({ error: "Faltam dados para criar o post" });
  }

  try {
    const [rows, fields] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const userID = Number(rows[0].id);
    if (!Number.isFinite(userID)) {
      return res.status(500).json({ error: "userID inválido" });
    }

    const sql =
      "INSERT INTO posts (post_tittle, post_image, post_content, post_tags, userID) VALUES (?, ?, ?, ?, ?)";
    const params = [title, image, content, tags, userID];

    const [result] = await pool.execute(sql, params);
    return res
      .status(201)
      .json({ id: result.insertId, title, image, content, tags, userID });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/* Delete dos Posts */
app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute("DELETE FROM posts WHERE post_id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    res.json({ ok: true, message: "Post deletado com sucesso" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Edição do Post */
app.put("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { email, title, image, content, tags } = req.body;
  try {
    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows | (rows.length === 0))
      return res.status(404).json({ error: "Usuário não encontrado" });

    const userID = rows[0].id;
    const sql = `
      UPDATE posts
      SET post_tittle = ?, post_image = ?, post_content = ?, post_tags = ?
      WHERE post_id = ? AND userID = ?
    `;
    const [result] = await pool.execute(sql, [
      title,
      image,
      content,
      tags,
      id,
      userID,
    ]);

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ error: "Post não encontrado ou não pertence ao usuário" });

    res.json({ ok: true, id, title, image, content, tags });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Listar posts
app.get("/api/posts/list", async (req, res) => {
  try {
    const sql = `
          SELECT
            p.postID AS id,
            p.post_tittle,
            p.post_content,
            p.post_tags,
            p.post_image,
            p.userID,
            u.id       AS author_id,
            u.name     AS author_name,
            u.email    AS author_email,
            u.created_at AS author_created_at
          FROM posts p
          INNER JOIN users u ON p.userID = u.id
        `;
    const [rows] = await pool.execute(sql);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 37844;
app.listen(PORT, () => {
  console.log(`Guaraná ouvido em http://localhost:${PORT}`);
});
