// src/components/ContactsView.jsx
import React, { useState } from 'react';
import ContactListItem from './ContactListItem';
import ContactForm from './ContactForm';

function ContactsView({
  contacts,
  isLoading,
  error,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onLogout,
  onNavigateToDirectory,
  searchTerm,
  setSearchTerm
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null); // Contato atualmente em edição
  const [actionMessage, setActionMessage] = useState({type: '', text: ''});


  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
    setActionMessage({type:'', text:''}); // Limpa mensagens anteriores
  };

  const handleDelete = (contactId) => {
    if (window.confirm("Tem certeza que deseja excluir este contato?")) {
        onDeleteContact(contactId, (success, message) => {
            setActionMessage({type: success ? 'success' : 'error', text: message});
        });
    }
  };

  const handleFormSubmit = (formData, callback) => {
    if (editingContact) {
      onUpdateContact(editingContact.id, formData, (success, message) => {
        callback(success, message); // Passa o resultado para o ContactForm
        if (success) {
            // setShowForm(false); // O ContactForm já fecha ao ter sucesso na edição
            // setEditingContact(null);
        }
      });
    } else {
      onAddContact(formData,  (success, message) => {
        callback(success, message); // Passa o resultado para o ContactForm
        if (success) {
            // setShowForm(false); // O ContactForm já limpa o form ao ter sucesso na adição
        }
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingContact(null);
    setActionMessage({type:'', text:''});
  }

  const handleOpenNewContactForm = () => {
    setEditingContact(null);
    setShowForm(true);
    setActionMessage({type:'', text:''});
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Minha Agenda Pessoal</h1>
            <div>
              <button
                onClick={onNavigateToDirectory}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-md mr-2 transition duration-150"
              >
                Diretório Geral
              </button>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition duration-150"
              >
                Sair
              </button>
            </div>
          </div>

          {actionMessage.text && (
            <p className={`text-sm mb-4 ${actionMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {actionMessage.text}
            </p>
          )}
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm"
            />
          </div>

          {!showForm ? (
            <button
              onClick={handleOpenNewContactForm}
              className="w-full mb-6 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
            >
              Adicionar Novo Contato
            </button>
          ) : (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
                {editingContact ? "Editar Contato" : "Adicionar Novo Contato"}
              </h2>
              <ContactForm
                onSubmit={handleFormSubmit}
                initialData={editingContact}
                onCancel={handleCancelForm}
                submitButtonText={editingContact ? "Salvar Alterações" : "Adicionar Contato"}
              />
            </div>
          )}


          {isLoading && <p className="text-center py-4">Carregando contatos...</p>}
          {error && <p className="text-red-500 text-center py-4">{error}</p>}
          {!isLoading && !error && contacts.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum contato na sua agenda.</p>
          )}
          {!isLoading && !error && contacts.length > 0 && (
            <ul className="space-y-3">
              {contacts.map((contact) => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactsView;