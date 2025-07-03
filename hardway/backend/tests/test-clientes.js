const axios = require('axios');

async function testClientesFromBackend() {
  console.log('🧪 PRUEBA DE CLIENTES DESDE BACKEND');
  console.log('===================================\n');
  
  try {
    console.log('1. Probando endpoint /api/clientes directamente...');
    
    const response = await axios.get('http://localhost:3001/api/clientes');
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   👥 Total clientes: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('\n   📋 Primer cliente:');
      const primer = response.data[0];
      console.log(`      • ID: ${primer.id}`);
      console.log(`      • Nombre: ${primer.nombre}`);
      console.log(`      • Tipo Documento: ${primer.tipoDocumento}`);
      console.log(`      • Número Documento: ${primer.numeroDocumento}`);
      console.log(`      • Teléfono: ${primer.telefono}`);
      console.log(`      • Localidad: ${primer.localidad}`);
      console.log(`      • Email: ${primer.email}`);
      console.log(`      • Barrio: ${primer.barrio}`);
      console.log(`      • CP: ${primer.cp}`);
      
      console.log('\n   🔍 Estructura completa del primer cliente:');
      console.log(JSON.stringify(primer, null, 4));
    }

    console.log('\n2. Probando endpoint desde frontend...');
    
    const responseFrontend = await axios.get('http://localhost:5173/api/clientes');
    
    console.log(`   ✅ Status frontend: ${responseFrontend.status}`);
    console.log(`   👥 Total desde frontend: ${responseFrontend.data.length}`);

  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    
    if (error.response?.data) {
      console.log('   📝 Respuesta completa:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n🏁 Prueba completada');
}

testClientesFromBackend();
