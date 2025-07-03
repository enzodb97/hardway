/**
 * config.js
 * Configuración centralizada para todos los scripts de prueba
 */

module.exports = {
  // URL base de la API
  API_URL: 'http://localhost:3001',
  
  // Credenciales de administrador
  ADMIN: {
    username: 'admin',
    password: 'admin123'
  },
  
  // Credenciales de picker
  PICKER: {
    username: 'luisrd',
    password: '123'
  },
  
  // Parámetros para datos de prueba
  TEST_DATA: {
    // Prefijo para elementos de prueba, para identificarlos fácilmente
    prefix: 'TEST-AUTO-',
    
    // Cliente de prueba
    cliente: {
      nombre: "Cliente Prueba Automatizada",
      cuit: "20123456789",
      email: "test-auto@example.com",
      telefono: "1122334455"
    },
    
    // Indumentaria de prueba
    indumentaria: {
      codigo: "TEST-AUTO-INDUM",
      descripcion: "Indumentaria Prueba Automatizada",
      precio: 1500,
      talle: "L",
      stock: 10
    }
  },
  
  // Timeout para esperar resultados (en milisegundos)
  TIMEOUT: 10000
};
