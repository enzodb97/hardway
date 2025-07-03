const axios = require('axios');

async function testEnviosWithAuth() {
  console.log('🧪 PRUEBA DE ENVÍOS CON AUTENTICACIÓN');
  console.log('=====================================\n');
  
  try {
    console.log('1. Probando endpoint directo al backend con headers...');
    
    const response = await axios.get('http://localhost:3001/api/envios/pendientes', {
      headers: {
        nombreusuario: 'admin'
      }
    });
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log('   📋 Pedidos pendientes de envío:');
    console.log(`   📊 Total: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('   📦 Primer pedido:');
      const primer = response.data[0];
      console.log(`      • Pedido: ${primer.numeroPedido}`);
      console.log(`      • Cliente: ${primer.nombre} ${primer.apellido}`);
      console.log(`      • Email: ${primer.cliente_email}`);
      console.log(`      • Dirección: ${primer.direccion_envio}`);
      console.log(`      • Items: ${primer.total_items}`);
    }

    console.log('\n2. Probando endpoint a través del frontend con headers simulados...');
    
    const responseFrontend = await axios.get('http://localhost:5173/api/envios/pendientes', {
      headers: {
        nombreusuario: 'admin'
      }
    });
    
    console.log(`   ✅ Status frontend: ${responseFrontend.status}`);
    console.log(`   📊 Total desde frontend: ${responseFrontend.data.length}`);

  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    
    if (error.response?.data) {
      console.log('   📝 Respuesta completa:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n🏁 Prueba completada');
}

testEnviosWithAuth();
