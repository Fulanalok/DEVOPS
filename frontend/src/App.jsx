import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthPage from "../components/AuthPage";
import LoggedInView from "../components/LoggedInView";
import ContactsView from "../components/ContactsView";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [directoryEntries, setDirectoryEntries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registerFeedback, setRegisterFeedback] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState("directory");

  const handleLogin = async (loginData) => {
    setLoginError("");
    try {
      const res = await axios.post(`${API_URL}/login`, loginData);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setIsLoggedIn(true);
    } catch (error) {
      setLoginError(`Erro no login: ${error.response ? error.response.data : "Credenciais inválidas"}`);
    }
  };

  const handleRegister = async (registerData) => {
    setRegisterFeedback({ type: '', message: '' });
    try {
      await axios.post(`${API_URL}/register`, registerData);
      setRegisterFeedback({ type: 'success', message: 'Usuário registrado com sucesso! Faça o login.' });
    } catch (error) {
      if (error.response && error.response.data && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(" ");
        setRegisterFeedback({ type: 'error', message: `Erro no registro: ${errorMessages}` });
      } else {
        setRegisterFeedback({ type: 'error', message: `Erro no registro: ${error.response ? error.response.data : error.message}` });
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
    setDirectoryEntries([]);
    setContacts([]);
    setSearchTerm('');
    setLoginError("");
    setRegisterFeedback({ type: '', message: '' });
  };

  const fetchDirectory = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/directory`, {
        headers: { Authorization: "Bearer " + token },
      });
      setDirectoryEntries(res.data);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        logout();
      }
    }
  };

  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    setContactsError("");
    try {
      const res = await axios.get(`${API_URL}/contacts`, {
        headers: { Authorization: "Bearer " + token },
      });
      setContacts(res.data);
    } catch (error) {
      setContactsError("Erro ao buscar contatos.");
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const addContact = async (contact) => {
    try {
      const res = await axios.post(`${API_URL}/contacts`, contact, {
        headers: { Authorization: "Bearer " + token },
      });
      setContacts([...contacts, res.data]);
    } catch (error) {
      setContactsError("Erro ao adicionar contato.");
    }
  };

  const updateContact = async (id, updatedContact) => {
    try {
      const res = await axios.put(`${API_URL}/contacts/${id}`, updatedContact, {
        headers: { Authorization: "Bearer " + token },
      });
      setContacts(contacts.map(c => (c.id === id ? res.data : c)));
    } catch (error) {
      setContactsError("Erro ao atualizar contato.");
    }
  };

  const deleteContact = async (id) => {
    try {
      await axios.delete(`${API_URL}/contacts/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error) {
      setContactsError("Erro ao deletar contato.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setCurrentView("directory");
      fetchDirectory();
    } else {
      setDirectoryEntries([]);
      setContacts([]);
      setSearchTerm('');
    }
  }, [isLoggedIn]);

  const renderCurrentView = () => {
    if (currentView === "directory") {
      return (
        <LoggedInView
          directoryEntries={directoryEntries}
          onLogout={logout}
          onNavigateToContacts={() => setCurrentView("contacts")}
        />
      );
    } else if (currentView === "contacts") {
      return (
        <ContactsView
          contacts={contacts}
          isLoading={isLoadingContacts}
          error={contactsError}
          onAddContact={addContact}
          onUpdateContact={updateContact}
          onDeleteContact={deleteContact}
          onLogout={logout}
          onNavigateToDirectory={() => setCurrentView("directory")}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      );
    }
    return null;
  };

  if (!isLoggedIn) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        loginError={loginError}
        registerFeedback={registerFeedback}
      />
    );
  }

  return <>{renderCurrentView()}</>;
}

export default App;