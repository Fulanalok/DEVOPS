// src/components/ContactForm.jsx
import React, { useState, useEffect } from 'react';

function ContactForm({ onSubmit, initialData, onCancel, submitButtonText = "Salvar" }) {
  const [formData, setFormData] = useState({
    nome: '',
    numero: '',
    email: '',
    observacoes: ''
  });
  const [formMessage, setFormMessage] = useState({type: '', text: ''});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        numero: initialData.numero || '',
        email: initialData.email || '',
        observacoes: initialData.observacoes || ''
      });
    } else {
      setFormData({ nome: '', numero: '', email: '', observacoes: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({type: '', text: ''});
    if (!formData.nome || !formData.numero) {
      setFormMessage({ type: 'error', text: 'Nome e Número são obrigatórios.' });
      return;
    }
    onSubmit(formData, (success, message) => {
      setFormMessage({ type: success ? 'success' : 'error', text: message });
      if (success && !initialData) {
        setFormData({ nome: '', numero: '', email: '', observacoes: '' });
      }
      if (success && onCancel) {
        setTimeout(() => onCancel(), 1500);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow">
      {formMessage.text && (
        <p className={`text-sm ${formMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {formMessage.text}
        </p>
      )}
      <div>
        <label htmlFor="contact-nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome*</label>
        <input type="text" name="nome" id="contact-nome" value={formData.nome} onChange={handleChange} required
               className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"/>
      </div>
      <div>
        <label htmlFor="contact-numero" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número*</label>
        <input type="tel" name="numero" id="contact-numero" value={formData.numero} onChange={handleChange} required
               className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"/>
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input type="email" name="email" id="contact-email" value={formData.email} onChange={handleChange}
               className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"/>
      </div>
      <div>
        <label htmlFor="contact-observacoes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
        <textarea name="observacoes" id="contact-observacoes" value={formData.observacoes} onChange={handleChange} rows="3"
                  className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md"></textarea>
      </div>
      <div className="flex space-x-2">
        <button type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md">
          {submitButtonText}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded-md">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default ContactForm;