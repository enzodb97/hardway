// src/config/axios.ts
import axios from 'axios';

// Configurar la instancia base de axios
// Para desarrollo con Vite, usar rutas relativas para aprovechar el proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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
    const token = localStorage.getItem("token");
    
    // Agregar header para todos los endpoints que requieren autenticación
    if (username && isAuthenticated) {
      config.headers.nombreusuario = username;
      
      // Incluir el token JWT en el header Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
