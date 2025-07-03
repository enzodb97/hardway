const axios = require('axios');

async function testEnviosFromFrontend() {
  console.log('🧪 PRUEBA DE ENVÍOS DESDE FRONTEND');
  console.log('==================================\n');
  
  try {
    // Simular la llamada como lo hace el frontend (usando proxy de Vite)
    console.log('1. Probando endpoint /api/envios/pendientes desde frontend...');
    
    const response = await axios.get('http://localhost:5173/api/envios/pendientes');
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log('   📋 Pedidos pendientes de envío:');
    console.log(`   📊 Total: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('   📦 Primer pedido:');
      console.log(JSON.stringify(response.data[0], null, 4));
    }

  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   🔍 El frontend no parece estar corriendo en localhost:5173');
    }
  }

  console.log('\n🏁 Prueba completada');
}

testEnviosFromFrontend();
