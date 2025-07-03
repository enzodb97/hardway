/**
 * verificar-sistema-completo.js
 * Script para ejecutar automáticamente todas las pruebas del sistema y mostrar un informe unificado
 */

const { spawn } = require('child_process');
const path = require('path');

// Definir los scripts de prueba en el orden deseado
const testsToRun = [
  // Verificación básica del sistema (endpoints y autenticación)
  '../verificar-sistema.js',
  
  // Verificación de operaciones CRUD
  'test-crud-completo.js',
  
  // Tests específicos para componentes individuales
  'test-login.js',
  'test-pickers.js',
  'test-picking-simplificado.js', 
  'test-clientes.js',
  'test-pedidos.js',
  'test-envios-auth.js',
];

async function runTests() {
  console.log('🧪 VERIFICACIÓN COMPLETA DEL SISTEMA');
  console.log('=====================================');
  console.log('Ejecutando suite completa de tests...\n');

  const results = [];
  
  for (let i = 0; i < testsToRun.length; i++) {
    const test = testsToRun[i];
    console.log(`\n[${i+1}/${testsToRun.length}] Ejecutando: ${path.basename(test)}`);
    console.log('-------------------------------------');
    
    try {
      // Ejecutar cada script y esperar a que termine
      const testResult = await runScript(test);
      results.push({
        script: test,
        success: testResult.exitCode === 0,
        output: testResult.output
      });
    } catch (error) {
      console.log(`   ❌ Error al ejecutar ${test}: ${error.message}`);
      results.push({
        script: test,
        success: false,
        error: error.message
      });
    }
  }
  
  // Mostrar resumen de resultados
  console.log('\n\n🏁 RESUMEN DE VERIFICACIÓN COMPLETA');
  console.log('=====================================');
  
  let successCount = 0;
  let failCount = 0;
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ [${index+1}] ${path.basename(result.script)}`);
      successCount++;
    } else {
      console.log(`❌ [${index+1}] ${path.basename(result.script)}`);
      failCount++;
    }
  });
  
  console.log('\n-------------------------------------');
  console.log(`Tests ejecutados: ${results.length}`);
  console.log(`✅ Tests exitosos: ${successCount}`);
  console.log(`❌ Tests fallidos: ${failCount}`);
  console.log('-------------------------------------');
  console.log('Verificación completada: ' + new Date().toLocaleString());
}

// Función para ejecutar un script Node.js como un proceso hijo
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.resolve(__dirname, scriptPath);
    
    console.log(`Ejecutando: ${fullPath}`);
    
    const child = spawn('node', [fullPath], {
      stdio: 'pipe', 
      shell: true
    });
    
    let output = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });
    
    child.on('close', (exitCode) => {
      resolve({
        exitCode,
        output
      });
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Ejecutar todos los tests
runTests().catch(err => {
  console.error('Error general:', err);
});
