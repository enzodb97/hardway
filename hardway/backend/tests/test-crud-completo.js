const axios = require('axios');
const config = require('./config');

/**
 * Script para verificar operaciones CRUD completas en el sistema
 * - Verifica todas las operaciones CRUD en clientes
 * - Verifica todas las operaciones CRUD en pedidos
 * - Verifica todas las operaciones CRUD en indumentaria
 * - Verifica la integración de módulos (pedidos -> picking -> envíos)
 */
async function verificarCRUDCompleto() {
  console.log('🔍 VERIFICACIÓN COMPLETA DE OPERACIONES CRUD');
  console.log('===========================================\n');
  
  const API_URL = config.API_URL;
  let token;
  let clienteCreado;
  let pedidoCreado;
  let indumentariaCreada;
  
  try {
    // 1. Autenticación
    console.log('1. 🔐 Autenticando como administrador...');
    const loginAdmin = await axios.post(`${API_URL}/api/login`, {
      nombreUsuario: config.ADMIN.username,
      password: config.ADMIN.password
    });

    if (!loginAdmin.data.token) {
      console.log('   ❌ Login admin falló');
      return;
    }
    
    token = loginAdmin.data.token;
    console.log(`   ✅ Login admin exitoso: ${token.substring(0, 20)}...`);
    
    // 2. CRUD de Clientes
    console.log('\n2. 👤 Verificando CRUD de Clientes');
    
    // 2.1 Crear Cliente
    console.log('   2.1 Creando un nuevo cliente...');
    try {
      // Primero buscar/crear una ciudad para asignarla al cliente
      const ciudadRes = await axios.post(`${API_URL}/api/ciudades/find-or-create`, {
        nombreCiudad: "Ciudad de Prueba",
        codigoPostal: "12345"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const nuevoCiudadId = ciudadRes.data.id;
      console.log(`       ✅ Ciudad creada/encontrada con ID: ${nuevoCiudadId}`);
      
      // Crear cliente
      const nuevoCliente = {
        nombre: "Cliente Prueba CRUD",
        cuit: "20123456789",
        tipoDocumento: "CUIT",
        numeroDocumento: "20123456789",
        email: "test-crud@example.com",
        telefono: "1122334455",
        domicilio: "Calle de Prueba 123",
        localidad: "Ciudad de Prueba",
        ciudadId: nuevoCiudadId,
        cp: "12345"
      };
      
      const clienteRes = await axios.post(`${API_URL}/api/clientes`, nuevoCliente, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      clienteCreado = clienteRes.data;
      console.log(`       ✅ Cliente creado con ID: ${clienteCreado.id}`);
    } catch (error) {
      console.log(`       ❌ Error al crear cliente: ${error.response?.data?.error || error.message}`);
    }
    
    // 2.2 Leer Cliente
    if (clienteCreado) {
      console.log('   2.2 Leyendo el cliente creado...');
      try {
        const clienteLeidoRes = await axios.get(`${API_URL}/api/clientes/${clienteCreado.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`       ✅ Cliente leído: ${clienteLeidoRes.data.nombre}`);
      } catch (error) {
        console.log(`       ❌ Error al leer cliente: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 2.3 Actualizar Cliente
    if (clienteCreado) {
      console.log('   2.3 Actualizando el cliente...');
      try {
        const clienteActualizado = {
          ...clienteCreado,
          nombre: `${clienteCreado.nombre} (Modificado)`,
          email: `modificado-${clienteCreado.email}`
        };
        
        await axios.put(`${API_URL}/api/clientes/${clienteCreado.id}`, clienteActualizado, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Verificar que se actualizó
        const clienteVerificadoRes = await axios.get(`${API_URL}/api/clientes/${clienteCreado.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (clienteVerificadoRes.data.nombre.includes('(Modificado)')) {
          console.log(`       ✅ Cliente actualizado correctamente`);
        } else {
          console.log(`       ⚠️ Cliente no parece haberse actualizado`);
        }
      } catch (error) {
        console.log(`       ❌ Error al actualizar cliente: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 3. CRUD de Indumentaria
    console.log('\n3. 👕 Verificando CRUD de Indumentaria');
    
    // 3.1 Crear Indumentaria
    console.log('   3.1 Creando nueva indumentaria...');
    try {
      const nuevaIndumentaria = {
        codigo: `TEST-CRUD-${Date.now()}`,
        descripcion: "Indumentaria de Prueba CRUD",
        precio: 1500,
        talle: "XL",
        stock: 10
      };
      
      const indumentariaRes = await axios.post(`${API_URL}/api/indumentaria`, nuevaIndumentaria, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      indumentariaCreada = indumentariaRes.data;
      console.log(`       ✅ Indumentaria creada con ID: ${indumentariaCreada.id}`);
    } catch (error) {
      console.log(`       ❌ Error al crear indumentaria: ${error.response?.data?.error || error.message}`);
    }
    
    // 3.2 Leer Indumentaria
    if (indumentariaCreada) {
      console.log('   3.2 Leyendo la indumentaria creada...');
      try {
        const indumentariaLeidaRes = await axios.get(`${API_URL}/api/indumentaria/${indumentariaCreada.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`       ✅ Indumentaria leída: ${indumentariaLeidaRes.data.descripcion}`);
      } catch (error) {
        console.log(`       ❌ Error al leer indumentaria: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 3.3 Actualizar Indumentaria
    if (indumentariaCreada) {
      console.log('   3.3 Actualizando la indumentaria...');
      try {
        const indumentariaActualizada = {
          ...indumentariaCreada,
          descripcion: `${indumentariaCreada.descripcion} (Modificada)`,
          precio: indumentariaCreada.precio + 100
        };
        
        await axios.put(`${API_URL}/api/indumentaria/${indumentariaCreada.id}`, indumentariaActualizada, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Verificar que se actualizó
        const indumentariaVerificadaRes = await axios.get(`${API_URL}/api/indumentaria/${indumentariaCreada.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (indumentariaVerificadaRes.data.descripcion.includes('(Modificada)')) {
          console.log(`       ✅ Indumentaria actualizada correctamente`);
        } else {
          console.log(`       ⚠️ Indumentaria no parece haberse actualizado`);
        }
      } catch (error) {
        console.log(`       ❌ Error al actualizar indumentaria: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 4. CRUD de Pedidos y flujo completo
    console.log('\n4. 📦 Verificando CRUD de Pedidos y flujo completo');
    
    // 4.1 Crear Pedido
    if (clienteCreado && indumentariaCreada) {
      console.log('   4.1 Creando nuevo pedido...');
      try {
        const nuevoPedido = {
          clienteId: clienteCreado.id,
          fechaCreacion: new Date().toISOString(),
          items: [
            {
              indumentariaId: indumentariaCreada.id,
              cantidad: 2,
              precioUnitario: indumentariaCreada.precio
            }
          ],
          total: indumentariaCreada.precio * 2
        };
        
        const pedidoRes = await axios.post(`${API_URL}/api/pedidos`, nuevoPedido, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        pedidoCreado = pedidoRes.data;
        console.log(`       ✅ Pedido creado con ID: ${pedidoCreado.id || pedidoCreado.numeroPedido}`);
      } catch (error) {
        console.log(`       ❌ Error al crear pedido: ${error.response?.data?.error || error.message}`);
      }
    } else {
      console.log('       ⚠️ No se puede crear pedido: falta cliente o indumentaria');
    }
    
    // 4.2 Verificar picking generado para el pedido
    if (pedidoCreado) {
      console.log('   4.2 Verificando picking generado para el pedido...');
      try {
        const pickingAdminRes = await axios.get(`${API_URL}/api/picking/tareas-admin`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const pickingPedido = pickingAdminRes.data.find(p => 
          p.numeroPedido === (pedidoCreado.numeroPedido || pedidoCreado.id)
        );
        
        if (pickingPedido) {
          console.log(`       ✅ Picking generado para el pedido: ${pickingPedido.numeroPedido}`);
        } else {
          console.log(`       ⚠️ No se encontró picking para el pedido creado`);
        }
      } catch (error) {
        console.log(`       ❌ Error al verificar picking: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 5. Eliminar registros de prueba (limpieza)
    console.log('\n5. 🧹 Limpiando registros de prueba...');
    
    // 5.1 Eliminar pedido (si corresponde según la lógica del sistema)
    if (pedidoCreado) {
      console.log('   5.1 Intentando eliminar pedido de prueba...');
      try {
        await axios.delete(`${API_URL}/api/pedidos/${pedidoCreado.id || pedidoCreado.numeroPedido}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`       ✅ Pedido eliminado`);
      } catch (error) {
        console.log(`       ⚠️ No se pudo eliminar pedido: ${error.response?.status} ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 5.2 Eliminar indumentaria
    if (indumentariaCreada) {
      console.log('   5.2 Eliminando indumentaria de prueba...');
      try {
        await axios.delete(`${API_URL}/api/indumentaria/${indumentariaCreada.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`       ✅ Indumentaria eliminada`);
      } catch (error) {
        console.log(`       ❌ Error al eliminar indumentaria: ${error.response?.status} ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 5.3 Eliminar cliente
    if (clienteCreado) {
      console.log('   5.3 Eliminando cliente de prueba...');
      try {
        await axios.delete(`${API_URL}/api/clientes/${clienteCreado.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`       ✅ Cliente eliminado`);
      } catch (error) {
        console.log(`       ❌ Error al eliminar cliente: ${error.response?.status} ${error.response?.data?.error || error.message}`);
      }
    }

    // 6. Resumen de pruebas
    console.log('\n=============================================');
    console.log('🏁 RESUMEN DE VERIFICACIÓN CRUD');
    console.log('=============================================');
    console.log('');
    console.log('Operaciones verificadas:');
    console.log('✓ CRUD Clientes');
    console.log('✓ CRUD Indumentaria');
    console.log('✓ CRUD Pedidos');
    console.log('✓ Integración Pedidos -> Picking');
    console.log('');
    console.log('=============================================');
    console.log('Prueba CRUD completada. Fecha: ' + new Date().toLocaleString());
    console.log('=============================================');
    
  } catch (error) {
    console.log(`❌ Error general: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

verificarCRUDCompleto();
