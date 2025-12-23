const http = require('http');

function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Probando endpoints de presentaciones...\n');

  try {
    // Test 1: Verificar estado
    console.log('1️⃣  Verificando estado de configuraciones...');
    const estadoResult = await testEndpoint('/api/presentaciones/configuraciones/verificar/estado');
    console.log('   Status:', estadoResult.status);
    console.log('   Response:', JSON.stringify(estadoResult.data, null, 2));
    console.log('');

    // Test 2: Obtener todas las presentaciones
    console.log('2️⃣  Obteniendo todas las presentaciones...');
    const presentacionesResult = await testEndpoint('/api/presentaciones');
    console.log('   Status:', presentacionesResult.status);
    console.log('   Response:', JSON.stringify(presentacionesResult.data, null, 2));
    console.log('');

    console.log('✅ Tests completados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en tests:', error.message);
    process.exit(1);
  }
}

runTests();
