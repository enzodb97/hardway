const axios = require('axios');

async function testFrontendToBackend() {
  console.log('🧪 PRUEBA DE FRONTEND A BACKEND - PICKERS');
  console.log('==========================================\n');
  
  try {
    // Simular la llamada como lo hace el frontend (usando proxy de Vite)
    console.log('1. Probando endpoint /api/picking/pickers desde frontend...');
    
    const response = await axios.get('http://localhost:5173/api/picking/pickers');
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log('   📋 Pickers recibidos:');
    console.log(JSON.stringify(response.data, null, 4));
    
    // Verificar estructura esperada
    if (response.data && Array.isArray(response.data)) {
      console.log(`\n   📊 Total de pickers: ${response.data.length}`);
      
      response.data.forEach((picker, index) => {
        console.log(`   ${index + 1}. Picker:`, {
          id: picker.id,
          legajo: picker.legajo,
          nombre: picker.nombre,
          nombreCompleto: picker.nombreCompleto
        });
        
        // Verificar que tenga los campos necesarios
        if (!picker.nombre) {
          console.log(`   ⚠️  El picker ${picker.id} no tiene campo 'nombre'`);
        }
      });
    } else {
      console.log('   ❌ La respuesta no es un array válido');
    }

  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   🔍 El frontend no parece estar corriendo en localhost:5173');
    }
  }

  console.log('\n🏁 Prueba completada');
}

testFrontendToBackend();
