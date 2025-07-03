const axios = require('axios');

async function testPicking() {
  try {
    console.log('Probando picking con picker...');
    
    // Login del picker
    const login = await axios.post('http://localhost:3001/api/login', {
      nombreUsuario: 'luisrd',
      password: '123'
    });
    
    const token = login.data.token;
    console.log('Token picker:', token);
    console.log('Legajo:', login.data.legajoPicker);
    
    // Probar endpoint de picking
    const picking = await axios.get('http://localhost:3001/api/picking/tareas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Picking resultado:', picking.data.length, 'tareas');
    if (picking.data.length > 0) {
      console.log('Primera tarea:', picking.data[0].numeroPedido);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testPicking();
