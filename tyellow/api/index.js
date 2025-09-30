
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import serverless from "serverless-http";

dotenv.config();

const app = express();

// Configuração do CORS (ajuste se precisar acessar de outro domínio)
app.use(
  cors({
    origin: ["https://tiny-yellow-1et1.vercel.app"], // pode adicionar outros domínios
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Pool de conexão (lazy init)
let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
      queueLimit: 0,
    });
  }
  return pool;
}

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const [rows] = await getPool().query("SELECT 1 AS ok");
    res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Rota raiz da API
app.get("/api", (_req, res) =>
  res.json({ ok: true, service: "TinyYellow API Server", base: "/api" })
);

// Listar usuários
app.get("/api/users/list", async (_req, res) => {
  try {
    const [rows] = await getPool().execute("SELECT * FROM users");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Registrar usuário
app.post("/api/register", async (req, res) => {
  const { displayName, email, password } = req.body;
  if (!displayName || !email || !password) {
    return res
      .status(400)
      .json({ error: "displayName, email e password são obrigatórios" });
  }

  try {
    const [result] = await getPool().execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [displayName, email, password]
    );
    res.status(201).json({ id: result.insertId, displayName, email });
  } catch (e) {
    if (e && e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    res.status(500).json({ error: e.message });
  }
});

// Criar post
app.post("/api/posts/create", async (req, res) => {
  const { email, title, image, content, tags } = req.body;
  if (!email || !title || !content) {
    return res.status(400).json({ error: "Faltam dados para criar o post" });
  }

  try {
    const [rows] = await getPool().execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const userID = Number(rows[0].id);
    const sql =
      "INSERT INTO posts (post_tittle, post_image, post_content, post_tags, userID) VALUES (?, ?, ?, ?, ?)";
    const params = [title, image || null, content, tags || null, userID];

    const [result] = await getPool().execute(sql, params);
    res
      .status(201)
      .json({ id: result.insertId, title, image, content, tags, userID });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Listar posts
app.get("/api/posts/list", async (_req, res) => {
  try {
    const sql = `
SELECT
p.post_id AS id,
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
ORDER BY p.created_at DESC
    `;
    const [rows] = await getPool().execute(sql);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default serverless(app);


