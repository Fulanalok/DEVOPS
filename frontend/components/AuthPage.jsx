import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthPage({ onLogin, onRegister, loginError, registerFeedback }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <LoginForm onLogin={onLogin} loginError={loginError} />
      <RegisterForm onRegister={onRegister} registerFeedback={registerFeedback} />
    </div>
  );
}

export default AuthPage;