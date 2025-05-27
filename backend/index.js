const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "telefonesecretos";
console.log("Iniciando backend...");

// Configuração do Pool de Conexões com o MySQL
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

// Criação da tabela users
(async () => {
  try {
    console.log("Tentando criar/verificar tabela 'users'...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password TEXT,
        telefone VARCHAR(20) NULL  -- CORRIGIDO: 'telefone' (singular)
      );
    `);
    console.log("Tabela 'users' verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro ao criar/verificar a tabela 'users':", err);
  }
})();

// Criação da tabela celulares
(async () => {
  try {
    console.log("Criando/verificando a tabela 'celulares'...");
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
    console.log("Tabela 'celulares' verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro ao criar/verificar a tabela 'celulares':", err);
  }
})();

// autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("Token JWT não fornecido.");
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token JWT inválido:", err.message);
      return res.sendStatus(403); // 403 Erro forbiden
    }
    req.user = user;
    next();
  });
}

// Registro de novo usuário
app.post("/register", async (req, res) => {
  const { name, email, password, telefone } = req.body;
  console.log("Tentando registrar usuário:", email, "Telefone:", telefone);

  if (!name || !email || !password) {
    console.log(
      "Campos obrigatórios (nome, email, senha) faltando no registro."
    );
    return res.status(400).send("Nome, email e senha são obrigatórios.");
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, telefone) VALUES (?, ?, ?, ?)",
      [name, email, hashed, telefone || null]
    );
    console.log("Usuário registrado com sucesso:", email);
    res.status(201).send("Usuário registrado com sucesso.");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      console.log("Usuário já existe:", email);
      res.status(409).send("Usuário já existe."); // 409 erro Conflict
    } else {
      console.error("Erro ao registrar:", err);
      res.status(500).send("Erro interno no servidor ao registrar.");
    }
  }
});

// Login de usuário
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Tentando login para:", email);

  if (!email || !password) {
    console.log("Email ou senha não fornecidos no login.");
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
        {
          expiresIn: "1h", // uma hora de token
        }
      );
      console.log("Login bem-sucedido para:", email);
      res.json({ token });
    } else {
      console.log("Credenciais inválidas para:", email);
      res.status(401).send("Credenciais inválidas.");
    }
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).send("Erro interno no servidor ao tentar fazer login.");
  }
});

// Rota para obter informações do usuário logado
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
    console.error("Erro ao buscar dados do usuário logado:", err);
    res.status(500).send("Erro interno no servidor.");
  }
});

// Rota para listar usuários e seus telefones
app.get("/directory", authenticateToken, async (req, res) => {
  console.log("Usuário", req.user.email, "acessando o diretório.");
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, telefone FROM users ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar o diretório de usuários:", err);
    res.status(500).send("Erro interno no servidor ao buscar o diretório.");
  }
});

// Rota para atualizar perfil do usuário logado
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
    console.log("Perfil do usuário", userId, "atualizado com sucesso.");
    const [updatedUserRows] = await pool.query(
      "SELECT id, name, email, telefone FROM users WHERE id = ?",
      [userId]
    );
    res.json(updatedUserRows[0]);
  } catch (err) {
    console.error("Erro ao atualizar o perfil do usuário:", err);
    res.status(500).send("Erro interno do servidor ao atualizar perfil.");
  }
});

// ROTAS DA AGENDA PESSOAL //

// Adicionar um novo contato na agenda pessoal
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
    console.log(
      "Contato pessoal adicionado com sucesso:",
      result.insertId,
      "para o usuário:",
      userId
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
      console.error(
        "Erro ao adicionar contato pessoal: Número já existe para este usuário.",
        err
      );
      return res
        .status(409)
        .send("Este número de telefone já está na sua agenda.");
    }
    console.error("Erro ao adicionar contato pessoal:", err);
    res
      .status(500)
      .send("Erro interno no servidor ao adicionar contato pessoal.");
  }
});

// Listar todos os contatos da agenda pessoal do usuário logado
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
    console.error("Erro ao buscar contatos pessoais do usuário:", userId, err);
    res
      .status(500)
      .send("Erro interno no servidor ao buscar contatos pessoais.");
  }
});

// Obter um contato pessoal específico do usuário logado
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
    console.error("Erro ao buscar contato pessoal específico:", err);
    res.status(500).send("Erro interno no servidor.");
  }
});

// Atualizar um contato pessoal do usuário logado
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
    console.log(
      "Contato pessoal atualizado com sucesso:",
      contactId,
      "para o usuário:",
      userId
    );
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
      console.error(
        "Erro ao atualizar contato pessoal: Número já existe para este usuário.",
        err
      );
      return res
        .status(409)
        .send(
          "Este número de telefone já está na sua agenda em outro contato."
        );
    }
    console.error("Erro ao atualizar contato pessoal:", err);
    res
      .status(500)
      .send("Erro interno no servidor ao atualizar contato pessoal.");
  }
});

// Deletar um contato pessoal do usuário logado
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
    console.log(
      "Contato pessoal deletado com sucesso:",
      contactId,
      "pelo usuário:",
      userId
    );
    res.status(204).send(); // 204 No Content
  } catch (err) {
    console.error("Erro ao deletar contato pessoal:", err);
    res
      .status(500)
      .send("Erro interno no servidor ao deletar contato pessoal.");
  }
});

app.use((req, res, next) => {
  res.status(404).send("Desculpe, a rota que você tentou acessar não existe.");
});

// Erros básicos
app.use((err, req, res, next) => {
  console.error("Ocorreu um erro não tratado:", err.stack);
  res.status(500).send("Algo deu errado no servidor!");
});

console.log("Preparando para escutar na porta", port);
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});
console.log("Backend iniciado com sucesso.");
