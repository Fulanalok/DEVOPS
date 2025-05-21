const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = "segredo_super_secreto";
console.log("Iniciando backend real...");

const pool = mysql.createPool({
  host: "db",
  user: "user",
  password: "root",
  database: "docker",
  port: 3306,
});

app.use(cors());
app.use(express.json());

// Criação da tabela, com tratamento de erro
(async () => {
  try {
    console.log("Tentando criar/verificar tabela 'users'...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password TEXT
      );
    `);
    console.log("Tabela 'users' verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro ao criar/verificar a tabela 'users':", err);
  }
})();

// Middleware de autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("Token JWT não fornecido.");
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token JWT inválido.");
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Registro de novo usuário
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Tentando registrar usuário:", email);

  if (!name || !email || !password) {
    console.log("Campos obrigatórios faltando no registro.");
    return res.status(400).send("Todos os campos são obrigatórios");
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );
    console.log("Usuário registrado com sucesso:", email);
    res.sendStatus(201);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.log("Usuário já existe:", email);
      res.status(400).send("Usuário já existe");
    } else {
      console.error("Erro ao registrar:", err);
      res.status(500).send("Erro interno no servidor");
    }
  }
});

// Login de usuário
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Tentando login para:", email);

  if (!email || !password) {
    console.log("Email ou senha não fornecidos no login.");
    return res.status(400).send("Email e senha são obrigatórios");
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });
      console.log("Login bem-sucedido para:", email);
      res.json({ token });
    } else {
      console.log("Credenciais inválidas para:", email);
      res.status(401).send("Credenciais inválidas");
    }
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).send("Erro interno no servidor");
  }
});

// Listagem de usuários (rota protegida)
app.get("/users", authenticateToken, async (req, res) => {
  console.log("Listando usuários...");
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).send("Erro interno no servidor");
  }
});

console.log("Preparando para escutar na porta", port);
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});
