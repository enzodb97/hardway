const axios = require('axios');

async function testPickers() {
  console.log('🧪 PRUEBA DE ENDPOINT PICKERS');
  console.log('==============================\n');
  
  try {
    const response = await axios.get('http://localhost:3001/api/picking/pickers', {
      headers: {
        nombreusuario: 'admin'
      }
    });
    
    console.log(`✅ Pickers obtenidos: ${response.data.length} pickers`);
    console.log('📋 Lista de pickers:');
    response.data.forEach(picker => {
      console.log(`   - ${picker.legajo}: ${picker.nombreCompleto || 'Sin nombre'}`);
    });
    
  } catch (error) {
    console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    console.log(`   Detalles: ${error.code || 'Sin código'}`);
    console.log(`   URL: ${error.config?.url || 'Sin URL'}`);
  }
}

testPickers();
