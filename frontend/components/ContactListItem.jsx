    // src/components/ContactListItem.jsx
import React from 'react';

function ContactListItem({ contact, onEdit, onDelete }) {
  return (
    <li className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm flex justify-between items-start">
      <div>
        <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{contact.nome}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{contact.numero}</p>
        {contact.email && <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>}
        {contact.observacoes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{contact.observacoes}</p>}
      </div>
      <div className="flex space-x-2 flex-shrink-0 ml-4">
        <button onClick={() => onEdit(contact)}
                className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-2 rounded-md">
          Editar
        </button>
        <button onClick={() => onDelete(contact.id)}
                className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded-md">
          Excluir
        </button>
      </div>
    </li>
  );
}

export default ContactListItem;