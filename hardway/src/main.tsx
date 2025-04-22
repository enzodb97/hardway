import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Selección del elemento contenedor
const container = document.getElementById('root') as HTMLElement;

// Validación de existencia del contenedor
if (!container) {
  throw new Error('No se encontró el elemento root en index.html');
}

// Creación del root
const root = createRoot(container);

// Renderizado de la aplicación
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);