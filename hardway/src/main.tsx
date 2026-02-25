import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Selección del elemento contenedor
const container = document.getElementById('root') as HTMLElement;

// Validación de existencia del contenedor
if (!container) {
  throw new Error('No se encontró el elemento root en index.html');
}

// Creación del root
const root = createRoot(container);

// Renderizado de la aplicación
// AuthProvider está dentro de App.tsx, no aquí (evitar duplicación)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);