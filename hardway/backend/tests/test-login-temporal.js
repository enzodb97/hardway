const axios = require('axios');

async function testLoginTemporal() {
  console.log('🔐 PRUEBA DE LOGIN TEMPORAL PARA PICKERS');
  console.log('==========================================\n');
  
  try {
    // 1. Login con credentials de picker
    console.log('1. Probando login con luisrd...');
    const loginResponse = await axios.post('http://localhost:3001/api/login', {
      nombreUsuario: 'luisrd',
      password: '123'
    });

    if (loginResponse.data.token) {
      console.log('   ✅ Login exitoso');
      console.log(`   📝 Token: ${loginResponse.data.token.substring(0, 30)}...`);
      console.log(`   👤 Usuario: ${loginResponse.data.nombreUsuario}`);
      console.log(`   🏷️ Legajo Picker: ${loginResponse.data.legajoPicker}`);
      console.log(`   🔑 Rol: ${loginResponse.data.rolNombre}`);

      const token = loginResponse.data.token;

      // 2. Probar endpoint de tareas con token
      console.log('\n2. Probando acceso a tareas de picking...');
      try {
        const tareasResponse = await axios.get('http://localhost:3001/api/picking/tareas', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(`   ✅ Tareas obtenidas: ${tareasResponse.data.length} tareas`);
        
        if (tareasResponse.data.length > 0) {
          const primeraTarea = tareasResponse.data[0];
          console.log(`   📋 Primera tarea: ${primeraTarea.numeroPedido}`);

          // 3. Probar completar tarea
          console.log('\n3. Probando completar tarea...');
          try {
            const completarResponse = await axios.post(
              `http://localhost:3001/api/picking/tareas/${primeraTarea.numeroPedido}/completar`,
              { observaciones: 'Test desde script' },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            console.log('   ✅ Tarea completada exitosamente');
            console.log(`   📝 Respuesta: ${completarResponse.data.message}`);
          } catch (error) {
            console.log(`   ❌ Error al completar: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error al obtener tareas: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }

    } else {
      console.log('   ❌ Login falló - no se obtuvo token');
    }

  } catch (error) {
    console.log(`❌ Error en login: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
  }

  console.log('\n🏁 Prueba completada');
}

testLoginTemporal();
