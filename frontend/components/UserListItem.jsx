// src/components/UserListItem.jsx
import React from 'react';

function UserListItem({ user }) {
  return (
    <li
      className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm transition-colors duration-300"
    >
      <p className="font-semibold text-gray-700 dark:text-gray-200">{user.name}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Telefone: {user.telefone || "Não informado"}
      </p>
    </li>
  );
}

export default UserListItem;    