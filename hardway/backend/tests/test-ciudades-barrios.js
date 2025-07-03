// test-ciudades-barrios.js - Verificar que las rutas de ciudades y barrios funcionen correctamente
const axios = require('axios');

async function testCiudadesBarrios() {
  try {
    console.log('🧪 Test de rutas de ciudades y barrios\n');
    
    const API_URL = 'http://localhost:3001';
    
    // 1. Probar crear o encontrar una ciudad
    console.log('📍 1. Probando POST /api/ciudades/find-or-create');
    const ciudadData = {
      nombreCiudad: 'Mar del Plata',
      codigoPostal: '7600'
    };
    
    const ciudadRes = await axios.post(`${API_URL}/api/ciudades/find-or-create`, ciudadData);
    console.log('✅ Respuesta:', ciudadRes.data);
    const idCiudad = ciudadRes.data.idCiudad;
    
    // 2. Probar crear o encontrar un barrio
    console.log('\n📍 2. Probando POST /api/barrios/find-or-create');
    const barrioData = {
      nombreBarrio: 'La Perla',
      idCiudad
    };
    
    const barrioRes = await axios.post(`${API_URL}/api/barrios/find-or-create`, barrioData);
    console.log('✅ Respuesta:', barrioRes.data);
    
    // 3. Verificar que ahora existe en el listado de ciudades
    console.log('\n📍 3. Probando GET /api/ciudades');
    const ciudadesRes = await axios.get(`${API_URL}/api/ciudades`);
    console.log(`✅ Total de ciudades: ${ciudadesRes.data.length}`);
    const ciudadEncontrada = ciudadesRes.data.find(c => c.idCiudad === idCiudad);
    if (ciudadEncontrada) {
      console.log(`✅ Ciudad encontrada: ${ciudadEncontrada.nombreCiudad} (CP: ${ciudadEncontrada.codigoPostal})`);
    } else {
      console.log('❌ No se encontró la ciudad en el listado');
    }
    
    console.log('\n✅ Test completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en test:', error.response?.data || error.message);
  }
}

testCiudadesBarrios();
