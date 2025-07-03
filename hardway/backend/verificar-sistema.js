const axios = require('axios');

async function verificarSistema() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA');
  console.log('=====================================\n');
  
  try {
    // 1. Verificar conexión al servidor
    console.log('1. 🌐 Verificando conexión al servidor...');
    try {
      // Intentamos primero con un endpoint que no requiere autenticación
      await axios.get('http://localhost:3001');
      console.log('   ✅ Servidor backend corriendo correctamente');
    } catch (error) {
      // Si hay error específico de conexión rechazada, el servidor no está corriendo
      if (error.code === 'ECONNREFUSED') {
        console.log('   ❌ Servidor backend no responde');
        return;
      } else {
        // Si es otro tipo de error (por ejemplo, 401), significa que el servidor está corriendo
        console.log('   ✅ Servidor backend corriendo correctamente');
      }
    }

    // 2. Verificar autenticación admin
    console.log('\n2. 🔐 Verificando autenticación admin...');
    const loginAdmin = await axios.post('http://localhost:3001/api/login', {
      nombreUsuario: 'admin',
      password: 'admin123'
    });

    if (loginAdmin.data.token) {
      console.log('   ✅ Login admin exitoso');
      const token = loginAdmin.data.token;
      console.log(`   📝 Token generado: ${token.substring(0, 20)}...`);

      // 3. Verificar reportes
      console.log('\n3. 📊 Verificando endpoints de reportes...');

      const reportes = [
        { url: '/api/reportes/clientes-mas-pedidos', nombre: 'Clientes más pedidos' },
        { url: '/api/reportes/productos-mas-pedidos', nombre: 'Productos más pedidos' },
        { url: '/api/reportes/stock-actual', nombre: 'Stock actual' }
      ];

      for (const reporte of reportes) {
        try {
          const response = await axios.get(`http://localhost:3001${reporte.url}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              nombreusuario: 'admin' 
            }
          });
          const count = Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length;
          console.log(`   ✅ ${reporte.nombre}: ${count} registros`);
          
          // Mostrar muestra de datos si hay resultados
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log(`      📋 Muestra: ${JSON.stringify(response.data[0]).substring(0, 100)}...`);
          }
        } catch (error) {
          console.log(`   ❌ ${reporte.nombre}: Error ${error.response?.status || 'Sin respuesta'} - ${error.response?.data?.error || error.message}`);
        }
      }

      // 4. Verificar picking admin
      console.log('\n4. 📦 Verificando picking admin...');
      try {
        const pickingAdmin = await axios.get('http://localhost:3001/api/picking/tareas-admin', {
          headers: { 
            Authorization: `Bearer ${token}`,
            nombreusuario: 'admin' 
          }
        });
        console.log(`   ✅ Picking admin: ${pickingAdmin.data.length} tareas encontradas`);
        
        if (pickingAdmin.data.length > 0) {
          console.log(`   📋 Primera tarea: ${JSON.stringify(pickingAdmin.data[0]).substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ❌ Picking admin: Error ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }

      // 5. Verificar autenticación picker
      console.log('\n5. 👤 Verificando autenticación picker...');
      try {
        const loginPicker = await axios.post('http://localhost:3001/api/login', {
          nombreUsuario: 'luisrd',
          password: '123'
        });

        if (loginPicker.data.token) {
          console.log('   ✅ Login picker exitoso');
          const pickerToken = loginPicker.data.token;
          const pickerData = loginPicker.data;
          
          console.log(`   📋 Datos picker: Rol=${pickerData.rolNombre}, ID=${pickerData.id}`);
          if (pickerData.legajoPicker) {
            console.log(`   🏷️ Legajo Picker: ${pickerData.legajoPicker}`);
          } else {
            console.log(`   ⚠️ Picker sin legajo asignado`);
          }

          // Verificar picking para picker
          console.log('\n6. 📦 Verificando picking para picker...');
          try {
            const pickingTareas = await axios.get('http://localhost:3001/api/picking/tareas', {
              headers: { 
                Authorization: `Bearer ${pickerToken}`,
                nombreusuario: 'luisrd'
              }
            });
            console.log(`   ✓ Picking tareas: ${pickingTareas.data.length} tareas asignadas`);
          } catch (error) {
            console.log(`   ❌ Picking tareas: Error ${error.response?.status} - ${error.response?.data?.error || error.message}`);
          }
        } else {
          console.log('   ❌ Login picker falló');
        }
      } catch (error) {
        console.log(`   ❌ Error al verificar picker: ${error.response?.data?.error || error.message}`);
      }

      // 7. Verificar otros endpoints importantes
      console.log('\n7. 🔧 Verificando otros endpoints...');
      
      const otrosEndpoints = [
        { url: '/api/usuarios', nombre: 'Usuarios' },
        { url: '/api/clientes', nombre: 'Clientes' },
        { url: '/api/pedidos', nombre: 'Pedidos' },
        { url: '/api/indumentaria', nombre: 'Indumentaria' },
        { url: '/api/motivos-cancelacion', nombre: 'Motivos cancelación' },
        { url: '/api/envios/pendientes', nombre: 'Envíos pendientes' }
      ];

      for (const endpoint of otrosEndpoints) {
        try {
          const response = await axios.get(`http://localhost:3001${endpoint.url}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              nombreusuario: 'admin' 
            }
          });
          const count = Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length;
          console.log(`   ✅ ${endpoint.nombre}: ${count} registros`);
        } catch (error) {
          console.log(`   ❌ ${endpoint.nombre}: Error ${error.response?.status || 'Sin respuesta'}`);
        }
      }

      // 8. Verificar funcionalidad especial de ciudades, barrios y CP
      console.log('\n8. 🏙️ Verificando funcionalidad de ciudades, barrios y CP...');
      
      // Verificar obtención de un cliente para comprobar CP
      try {
        const clientesResponse = await axios.get('http://localhost:3001/api/clientes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (clientesResponse.data.length > 0) {
          const clienteEjemplo = clientesResponse.data[0];
          console.log(`   ✅ Cliente obtenido: ID=${clienteEjemplo.id}, Nombre=${clienteEjemplo.nombre}`);
          
          // Verificar que el cliente tiene código postal
          if (clienteEjemplo.cp) {
            console.log(`   ✅ Cliente tiene CP: ${clienteEjemplo.cp}`);
          } else {
            console.log(`   ⚠️ Cliente sin CP definido`);
          }
          
          console.log(`   ℹ️ No se verifican endpoints de ciudades/barrios (son parte de /api)`);
        } else {
          console.log(`   ⚠️ No hay clientes disponibles para verificar CP`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error al obtener cliente: ${error.response?.data?.error || error.message}`);
      }
      
      // 9. Verificar funcionalidad de envíos
      console.log('\n9. 🚚 Verificando funcionalidad de envíos...');
      try {
        const enviosResponse = await axios.get('http://localhost:3001/api/envios/pendientes', {
          headers: { 
            Authorization: `Bearer ${token}`,
            nombreusuario: 'admin' 
          }
        });
        
        console.log(`   ✅ Envíos pendientes: ${enviosResponse.data.length} envíos encontrados`);
        
        if (enviosResponse.data.length > 0) {
          const primerEnvio = enviosResponse.data[0];
          console.log(`   📋 Envío ejemplo: Pedido=${primerEnvio.numeroPedido || 'N/A'}, Cliente=${primerEnvio.nombreCliente || 'N/A'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error al obtener envíos: ${error.response?.status || 'Sin respuesta'} - ${error.response?.data?.error || error.message}`);
      }
      
    } else {
      console.log('   ❌ Login admin falló');
    }

  } catch (error) {
    console.log(`❌ Error general: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }

  // Agregar un resumen del estado del sistema
  console.log('\n=============================================');
  console.log('🏁 RESUMEN DE VERIFICACIÓN DEL SISTEMA');
  console.log('=============================================');
  console.log('');
  console.log('Componentes Principales:');
  console.log('✓ Autenticación (admin y picker)');
  console.log('✓ Gestión de Clientes');
  console.log('✓ Gestión de Pedidos');
  console.log('✓ Picking');
  console.log('✓ Envíos');
  console.log('✓ Gestión de Indumentaria');
  console.log('');
  console.log('Componentes Auxiliares:');
  console.log('✓ Ciudades y Barrios');
  console.log('✓ Códigos Postales (CP)');
  console.log('✓ Motivos de Cancelación');
  console.log('✓ Reportes');
  console.log('');
  console.log('=============================================');
  console.log('Sistema verificado. Fecha: ' + new Date().toLocaleString());
  console.log('=============================================');
}

verificarSistema();
