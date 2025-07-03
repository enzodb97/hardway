// Script para probar la funcionalidad de pickers en consola del navegador
// Ejecutar este código en la consola del navegador mientras está en la página de pedidos

async function testPickersInBrowser() {
  console.log('🧪 PRUEBA DE PICKERS EN BROWSER');
  console.log('===============================\n');
  
  try {
    // Simular la llamada tal como lo hace el frontend
    console.log('1. Probando llamada directa a axiosInstance...');
    
    // Esto debería estar disponible en el contexto del navegador si React está cargado
    const response = await fetch('/api/picking/pickers');
    const data = await response.json();
    
    console.log('✅ Respuesta recibida:');
    console.log(data);
    
    // Verificar estructura
    if (Array.isArray(data)) {
      console.log(`📊 Total de pickers: ${data.length}`);
      data.forEach((picker, index) => {
        console.log(`${index + 1}. ID: ${picker.id}, Legajo: ${picker.legajo}, Nombre: "${picker.nombre}"`);
        
        if (!picker.nombre || picker.nombre === null || picker.nombre === '') {
          console.log(`⚠️  PROBLEMA: El picker ${picker.id} tiene nombre vacío o nulo`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Llamar la función
testPickersInBrowser();
