// src/components/RegisterForm.jsx
import React, { useState, useEffect } from 'react';

function RegisterForm({ onRegister, registerFeedback }) {
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    telefone: "",
  });

  const handleChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(registerForm);
    if (registerFeedback.type === 'success') {
        setRegisterForm({ name: "", email: "", password: "", telefone: "" });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm transition-colors duration-300">
      <h1 className="text-2xl font-bold text-center text-gray-700 dark:text-gray-100 mb-4">
        Registrar Novo Usuário
      </h1>
      {registerFeedback.message && (
        <p className={`${registerFeedback.type === 'error' ? 'text-red-500' : 'text-green-500'} text-sm mb-4 text-center`}>
          {registerFeedback.message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Nome</label>
          <input
            id="reg-name"
            name="name"
            placeholder="Nome"
            value={registerForm.name}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
          />
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
          />
        </div>
        <div>
          <label htmlFor="reg-tel" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Telefone <span className="text-xs text-gray-500 dark:text-gray-400">(opcional)</span></label>
          <input
            id="reg-tel"
            name="telefone"
            placeholder="Telefone"
            value={registerForm.telefone}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-gray-600 dark:text-gray-300">Senha</label>
          <input
            id="reg-password"
            name="password"
            placeholder="Senha"
            type="password"
            value={registerForm.password}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;