
import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Conexão com o banco (Railway ou local)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// ✅ Rota de saúde
app.get("/api/health", (req, res) => {
  res.json({ status: "API rodando! 🚀" });
});

// ✅ Buscar posts
app.get("/api/posts", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Criar post
app.post("/api/create", async (req, res) => {
  try {
    const { title, content, user_id } = req.body;
    const [result] = await pool.query(
      "INSERT INTO posts (title, content, user_id, created_at) VALUES (?, ?, ?, NOW())",
      [title, content, user_id]
    );
    res.json({ message: "Post criado com sucesso!", postId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Registrar usuário
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())",
      [username, email, password] // ⚠️ Em produção, usar hash no password
    );
    res.json({ message: "Usuário registrado!", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rodar localmente (porta 3000)
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
  });
}

export default app;
