const axios = require('axios');

async function testLogin() {
  try {
    console.log('Probando login con admin/admin123...');
    
    const response = await axios.post('http://localhost:3001/api/login', {
      nombreUsuario: 'admin',
      password: 'admin123'
    });
    
    console.log('✓ Login exitoso:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Login falló:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Error:', error.message);
  }
}

testLogin();
