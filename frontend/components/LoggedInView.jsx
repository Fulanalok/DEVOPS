// src/components/LoggedInView.jsx
import React from 'react';
import UserListItem from './UserListItem';

function LoggedInView({ directoryEntries, onLogout, onNavigateToContacts }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Diretório Telefônico</h1>
          <div>
            <button
              onClick={onNavigateToContacts}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md mr-2 transition duration-150"
            >
              Minha Agenda
            </button>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition duration-150"
            >
              Sair
            </button>
          </div>
        </div>

        {directoryEntries.length > 0 ? (
          <ul className="space-y-3">
            {directoryEntries.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum usuário no diretório ou carregando...</p>
        )}
      </div>
    </div>
  );
}

export default LoggedInView;