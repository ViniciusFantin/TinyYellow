import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco Railway
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
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

// Rotas de exemplo
app.get("/api/users/list", async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/register", async (req, res) => {
    const { displayName, email, password } = req.body;
    if (!displayName || !email || !password) {
        return res
            .status(400)
            .json({ error: "displayName, email e password são obrigatórios" });
    }

    try {
        const [result] = await pool.query(
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

app.post("/api/posts/create", async (req, res) => {
    const { email, title, image, content, tags } = req.body;
    if (!email || !title || !content) {
        return res.status(400).json({ error: "Faltam dados para criar o post" });
    }

    try {
        const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
            email,
        ]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const userID = rows[0].id;
        const [result] = await pool.query(
            "INSERT INTO posts (post_tittle, post_image, post_content, post_tags, userID) VALUES (?, ?, ?, ?, ?)",
            [title, image || null, content, tags || null, userID]
        );

        res.status(201).json({ id: result.insertId, title, content, tags, userID });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/posts/list", async (_req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
         p.post_id AS id,
         p.post_tittle,
         p.post_content,
         p.post_tags,
         p.post_image,
         u.id AS author_id,
         u.name AS author_name,
         u.email AS author_email
       FROM posts p
       INNER JOIN users u ON p.userID = u.id
       ORDER BY p.created_at DESC`
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Export para Vercel (não usa serverless-http)
export default app;
