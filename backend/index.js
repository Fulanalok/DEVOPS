const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "telefonesecretos";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "docker",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(express.json());

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password TEXT,
        telefone VARCHAR(20) NULL
      );
    `);
  } catch (err) {}
})();

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS celulares (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        numero VARCHAR(20) NOT NULL, 
        email VARCHAR(100),
        observacoes TEXT,        
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, 
        UNIQUE (user_id, numero) 
      );
    `);
  } catch (err) {}
})();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.post("/register", async (req, res) => {
  const { name, email, password, telefone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("Nome, email e senha são obrigatórios.");
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, telefone) VALUES (?, ?, ?, ?)",
      [name, email, hashed, telefone || null]
    );
    res.status(201).send("Usuário registrado com sucesso.");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).send("Usuário já existe.");
    } else {
      res.status(500).send("Erro interno no servidor ao registrar.");
    }
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email e senha são obrigatórios.");
  }
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    } else {
      res.status(401).send("Credenciais inválidas.");
    }
  } catch (err) {
    res.status(500).send("Erro interno no servidor ao tentar fazer login.");
  }
});

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, telefone FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Usuário não encontrado.");
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).send("Erro interno no servidor.");
  }
});

app.get("/directory", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, telefone FROM users ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).send("Erro interno no servidor ao buscar o diretório.");
  }
});

app.put("/me/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, telefone } = req.body;
  if (!name && typeof telefone === "undefined") {
    return res.status(400).send("Nenhum dado fornecido para atualização.");
  }
  const fieldsToUpdate = [];
  const values = [];
  if (name) {
    fieldsToUpdate.push("name = ?");
    values.push(name);
  }
  if (typeof telefone !== "undefined") {
    fieldsToUpdate.push("telefone = ?");
    values.push(telefone === "" ? null : telefone);
  }
  if (fieldsToUpdate.length === 0) {
    return res.status(400).send("Nenhum campo válido para atualização.");
  }
  values.push(userId);
  try {
    const sql = `UPDATE users SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).send("Usuário não encontrado.");
    }
    const [updatedUserRows] = await pool.query(
      "SELECT id, name, email, telefone FROM users WHERE id = ?",
      [userId]
    );
    res.json(updatedUserRows[0]);
  } catch (err) {
    res.status(500).send("Erro interno do servidor ao atualizar perfil.");
  }
});

app.post("/contacts", authenticateToken, async (req, res) => {
  const { nome, numero, email, observacoes } = req.body;
  const userId = req.user.id;
  if (!nome || !numero) {
    return res
      .status(400)
      .send("Nome e número são obrigatórios para o contato.");
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO celulares (nome, numero, email, observacoes, user_id) VALUES (?, ?, ?, ?, ?)",
      [nome, numero, email || null, observacoes || null, userId]
    );
    res.status(201).json({
      id: result.insertId,
      nome,
      numero,
      email,
      observacoes,
      user_id: userId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .send("Este número de telefone já está na sua agenda.");
    }
    res
      .status(500)
      .send("Erro interno no servidor ao adicionar contato pessoal.");
  }
});

app.get("/contacts", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;
  try {
    let query =
      "SELECT id, nome, numero, email, observacoes FROM celulares WHERE user_id = ?";
    const queryParams = [userId];
    if (search) {
      query += " AND (nome LIKE ? OR numero LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    query += " ORDER BY nome ASC";
    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .send("Erro interno no servidor ao buscar contatos pessoais.");
  }
});

app.get("/contacts/:contactId", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { contactId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, numero, email, observacoes FROM celulares WHERE id = ? AND user_id = ?",
      [contactId, userId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .send("Contato pessoal não encontrado ou não pertence a este usuário.");
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).send("Erro interno no servidor.");
  }
});

app.put("/contacts/:contactId", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { contactId } = req.params;
  const { nome, numero, email, observacoes } = req.body;
  if (!nome || !numero) {
    return res
      .status(400)
      .send("Nome e número são obrigatórios para o contato.");
  }
  try {
    const [result] = await pool.query(
      "UPDATE celulares SET nome = ?, numero = ?, email = ?, observacoes = ? WHERE id = ? AND user_id = ?",
      [nome, numero, email || null, observacoes || null, contactId, userId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send(
          "Contato pessoal não encontrado ou não pertence a este usuário para atualização."
        );
    }
    res.json({
      id: Number(contactId),
      nome,
      numero,
      email,
      observacoes,
      user_id: userId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .send(
          "Este número de telefone já está na sua agenda em outro contato."
        );
    }
    res
      .status(500)
      .send("Erro interno no servidor ao atualizar contato pessoal.");
  }
});

app.delete("/contacts/:contactId", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { contactId } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM celulares WHERE id = ? AND user_id = ?",
      [contactId, userId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send(
          "Contato pessoal não encontrado ou não pertence a este usuário para deleção."
        );
    }
    res.status(204).send();
  } catch (err) {
    res
      .status(500)
      .send("Erro interno no servidor ao deletar contato pessoal.");
  }
});

app.use((req, res, next) => {
  res.status(404).send("Desculpe, a rota que você tentou acessar não existe.");
});

app.use((err, req, res, next) => {
  res.status(500).send("Algo deu errado no servidor!");
});

app.listen(port, () => {});
