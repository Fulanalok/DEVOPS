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
    // ... (lógica fetchDirectory inalterada)
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
      // Container principal da página de login/registro
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4"> {/* Fundo cinza claro, altura mínima da tela, centraliza conteúdo, padding */}
        
        {/* Card para o formulário de Login */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm mb-8"> {/* Fundo branco, padding, bordas arredondadas, sombra, largura máxima, margem inferior */}
          <h1 className="text-2xl font-bold text-center text-gray-700 mb-4"> {/* Tamanho do texto, negrito, centralizado, cor, margem inferior */}
            Login
          </h1>
          <form onSubmit={doLogin} className="space-y-4"> {/* Espaçamento entre os elementos do formulário */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-600">Email</label> {/* Estilo para o label */}
              <input
                id="login-email"
                name="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={handleLoginChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" /* Margem topo, largura total, padding, borda, arredondado, sombra, foco */
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-600">Senha</label>
              <input
                id="login-password"
                name="password"
                placeholder="Senha"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150" /* Largura total, cor de fundo, cor no hover, texto branco, negrito, padding, arredondado, transição */
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Linha divisória (opcional) */}
        {/* <hr className="w-full max-w-sm border-gray-300 mb-8" /> */}

        {/* Card para o formulário de Registro */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-gray-700 mb-4">
            Registrar Novo Usuário
          </h1>
          <form onSubmit={register} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-600">Nome</label>
              <input
                id="reg-name"
                name="name"
                placeholder="Nome"
                value={registerForm.name}
                onChange={handleRegisterChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-600">Email</label>
              <input
                id="reg-email"
                name="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="reg-tel" className="block text-sm font-medium text-gray-600">Telefone <span className="text-xs text-gray-500">(opcional)</span></label>
              <input
                id="reg-tel"
                name="telefone"
                placeholder="Telefone"
                value={registerForm.telefone}
                onChange={handleRegisterChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-600">Senha</label>
              <input
                id="reg-password"
                name="password"
                placeholder="Senha"
                type="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // PARTE QUANDO ESTÁ LOGADO (você aplicaria estilos aqui também)
  return (
    <div className="p-4"> {/* Padding geral */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"> {/* Largura máxima, centralizado, fundo branco, padding, arredondado, sombra */}
        <div className="flex justify-between items-center mb-6"> {/* Layout flex para alinhar título e botão */}
          <h1 className="text-3xl font-bold text-gray-800">Diretório Telefônico</h1>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md transition duration-150"
          >
            Sair
          </button>
        </div>
        
        {directoryEntries.length > 0 ? (
          <ul className="space-y-3"> {/* Espaçamento entre os itens da lista */}
            {directoryEntries.map((user) => (
              <li 
                key={user.id} 
                className="p-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm" /* Padding, fundo, borda, arredondado, sombra leve */
              >
                <p className="font-semibold text-gray-700">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Telefone: {user.telefone || "Não informado"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum usuário no diretório ou carregando...</p>
        )}
      </div>
    </div>
  );
}

export default App;