// src/components/LoginForm.jsx
import React, { useState } from 'react';

function LoginForm({ onLogin, loginError }) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginForm);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm mb-8 transition-colors duration-300">
      <h1 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-100 mb-4">
        Login
      </h1>
      {loginError && <p className="text-red-500 text-sm mb-4 text-center">{loginError}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
          <input
            id="login-email"
            name="email"
            type="email" 
            placeholder="Email"
            value={loginForm.email}
            onChange={handleChange}
            required 
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Senha</label>
          <input
            id="login-password"
            name="password"
            placeholder="Senha"
            type="password"
            value={loginForm.password}
            onChange={handleChange}
            required 
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default LoginForm;