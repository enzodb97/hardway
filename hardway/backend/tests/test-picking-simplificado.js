const axios = require('axios');

async function testPickingSimplificado() {
  console.log('🧪 PRUEBA DE PICKING SIMPLIFICADO');
  console.log('==================================\n');
  
  try {
    // 1. Simular header nombreusuario como hace el frontend
    console.log('1. Probando cargar tareas con header nombreusuario...');
    
    const tareasResponse = await axios.get('http://localhost:3001/api/picking/tareas', {
      headers: {
        nombreusuario: 'luisrd'
      }
    });
    
    console.log(`   ✅ Tareas cargadas: ${tareasResponse.data.length} tareas`);
    
    if (tareasResponse.data.length > 0) {
      const primeraTarea = tareasResponse.data[0];
      console.log(`   📋 Primera tarea: ${primeraTarea.numeroPedido}`);

      // 2. Probar ver picking list
      console.log('\n2. Probando ver picking list...');
      try {
        const pickingListResponse = await axios.get(`http://localhost:3001/api/picking/tareas/${primeraTarea.numeroPedido}`, {
          headers: {
            nombreusuario: 'luisrd'
          }
        });
        console.log('   ✅ Picking list obtenido correctamente');
        console.log(`   📦 Items: ${pickingListResponse.data.pedido?.DetallePedidos?.length || 0}`);
      } catch (error) {
        console.log(`   ❌ Error en picking list: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }

      // 3. Probar completar tarea
      console.log('\n3. Probando completar tarea...');
      try {
        const completarResponse = await axios.post(
          `http://localhost:3001/api/picking/tareas/${primeraTarea.numeroPedido}/completar`,
          { 
            idAsignacion: primeraTarea.idAsignacion || 1,
            observaciones: 'Test simplificado' 
          },
          {
            headers: {
              nombreusuario: 'luisrd'
            }
          }
        );
        console.log('   ✅ Tarea completada exitosamente');
        console.log(`   📝 Respuesta: ${completarResponse.data.message}`);
      } catch (error) {
        console.log(`   ❌ Error al completar: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
        if (error.response?.status === 404) {
          console.log('   🔍 Verificando si la URL es correcta...');
          console.log(`   📍 URL intentada: /api/picking/tareas/${primeraTarea.numeroPedido}/completar`);
        }
      }
    } else {
      console.log('   ⚠️ No hay tareas disponibles para probar');
    }

  } catch (error) {
    console.log(`❌ Error al cargar tareas: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
  }

  console.log('\n🏁 Prueba completada');
}

testPickingSimplificado();
