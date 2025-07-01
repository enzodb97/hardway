// src/config/axios.ts
import axios from 'axios';

// Configurar la instancia base de axios
// Para desarrollo con Vite, usar rutas relativas para aprovechar el proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar headers de autorización automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const username = localStorage.getItem("username");
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    
    // Agregar header para endpoints de pedidos si el usuario está autenticado
    if (username && isAuthenticated && config.url?.includes("/pedidos")) {
      config.headers.nombreUsuario = username;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Los errores de autorización se manejan en los componentes individuales
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
