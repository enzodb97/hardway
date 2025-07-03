const axios = require('axios');

async function testPedidos() {
  try {
    console.log('Probando endpoint de pedidos...');
    
    // Login admin
    const login = await axios.post('http://localhost:3001/api/login', {
      nombreUsuario: 'admin', 
      password: 'admin123'
    });
    
    const token = login.data.token;
    console.log('Token admin:', token);
    
    // Probar endpoint de pedidos
    const pedidos = await axios.get('http://localhost:3001/api/pedidos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Pedidos resultado:', pedidos.data.length, 'pedidos');
    
  } catch (error) {
    console.log('❌ Error pedidos:', error.response?.status, error.response?.data);
  }
}

testPedidos();
