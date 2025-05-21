import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [login, setLogin] = useState({ email: "", password: "" });

  const register = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/register`, form);
    setForm({ name: "", email: "", password: "" });
  };

  const doLogin = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${API_URL}/login`, login);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: "Bearer " + token },
    });
    setUsers(res.data);
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  if (!token) {
    return (
      <div>
        <h1>Login</h1>
        <form onSubmit={doLogin}>
          <input placeholder="Email" onChange={(e) => setLogin({ ...login, email: e.target.value })} />
          <input placeholder="Senha" type="password" onChange={(e) => setLogin({ ...login, password: e.target.value })} />
          <button>Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1>Usuários</h1>
      <form onSubmit={register}>
        <input placeholder="Nome" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Senha" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button>Cadastrar</button>
      </form>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} ({u.email})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
