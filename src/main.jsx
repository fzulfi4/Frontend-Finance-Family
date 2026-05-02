import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import './i18n';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { id, enUS } from 'date-fns/locale';

// Register datepicker locales globally
registerLocale('id', id);
registerLocale('en', enUS);
setDefaultLocale('id'); // IDN default

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
