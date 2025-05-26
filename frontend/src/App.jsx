import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [directoryEntries, setDirectoryEntries] = useState([]);

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    telefone: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register`, registerForm);
      alert("Usuário registrado com sucesso! Faça o login.");
      setRegisterForm({ name: "", email: "", password: "", telefone: "" });
    } catch (error) {
      console.error(
        "Erro no registro:",
        error.response ? error.response.data : error.message
      );
      alert(
        `Erro no registro: ${
          error.response ? error.response.data : error.message
        }`
      );
    }
  };

  const doLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, loginForm);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setIsLoggedIn(true);
      setLoginForm({ email: "", password: "" });
    } catch (error) {
      console.error(
        "Erro no login:",
        error.response ? error.response.data : error.message
      );
      alert(
        `Erro no login: ${
          error.response ? error.response.data : "Credenciais inválidas"
        }`
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
    setDirectoryEntries([]);
  };

  const fetchDirectory = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/directory`, {
        headers: { Authorization: "Bearer " + token },
      });
      setDirectoryEntries(res.data);
    } catch (error) {
      console.error(
        "Erro ao buscar diretório:",
        error.response ? error.response.data : error.message
      );
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        logout();
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchDirectory();
    }
  }, [token]);

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Login</h1>
        <form onSubmit={doLogin}>
          <input
            name="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={handleLoginChange}
          />
          <input
            name="password"
            placeholder="Senha"
            type="password"
            value={loginForm.password}
            onChange={handleLoginChange}
          />
          <button type="submit">Entrar</button>
        </form>

        <hr />

        <h1>Registrar Novo Usuário</h1>
        <form onSubmit={register}>
          <input
            name="name"
            placeholder="Nome"
            value={registerForm.name}
            onChange={handleRegisterChange}
          />
          <input
            name="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={handleRegisterChange}
          />
          <input
            name="telefone"
            placeholder="Telefone (opcional)"
            value={registerForm.telefone}
            onChange={handleRegisterChange}
          />{" "}
          {/* NOVO CAMPO */}
          <input
            name="password"
            placeholder="Senha"
            type="password"
            value={registerForm.password}
            onChange={handleRegisterChange}
          />
          <button type="submit">Cadastrar</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1>Diretório Telefônico de Usuários</h1>
      <button onClick={logout}>Sair</button>
      <ul>
        {directoryEntries.length > 0 ? (
          directoryEntries.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email}) - Telefone:{" "}
              {user.telefone || "Não informado"} {}
            </li>
          ))
        ) : (
          <p>Nenhum usuário no diretório ou carregando...</p>
        )}
      </ul>
    </div>
  );
}

export default App;
