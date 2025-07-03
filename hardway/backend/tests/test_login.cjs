const axios = require('axios');

async function testLogin() {
  try {
    console.log('Probando login con admin...');
    const response = await axios.post('http://localhost:3001/api/login', {
      nombreUsuario: 'admin',
      contrasena: 'admin123'
    });
    
    console.log('Login exitoso:', response.data);
    console.log('Rol recibido:', response.data.tipoRol);
    console.log('Tipo de rol:', typeof response.data.tipoRol);
    
    // Probar también la validación
    console.log('\nProbando validación...');
    const validateResponse = await axios.get(`http://localhost:3001/api/usuarios/validate?username=admin`);
    console.log('Validación:', validateResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testLogin();
