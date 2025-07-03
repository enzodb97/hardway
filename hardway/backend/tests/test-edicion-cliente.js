// test-edicion-cliente.js - Verificar que la edición de un cliente funcione correctamente
const axios = require('axios');

async function testEdicionCliente() {
  try {
    console.log('🧪 Test de edición de un cliente\n');
    
    const API_URL = 'http://localhost:3001';
    
    // 1. Obtener un cliente existente
    console.log('📋 1. Obteniendo un cliente existente...');
    const clientesRes = await axios.get(`${API_URL}/api/clientes`);
    
    if (clientesRes.data.length === 0) {
      console.log('❌ No hay clientes disponibles para probar');
      return;
    }
    
    const clienteOriginal = clientesRes.data[0];
    console.log(`✅ Cliente seleccionado: ID ${clienteOriginal.id} - ${clienteOriginal.nombre}`);
    console.log(`   CP actual: ${clienteOriginal.cp}`);
    
    // 2. Crear o encontrar una ciudad con un CP diferente
    console.log('\n📍 2. Buscando/creando una ciudad con CP diferente...');
    const nuevoCp = '9000'; // Usamos un CP diferente
    const nuevaLocalidad = clienteOriginal.localidad; // Mantenemos la misma localidad
    
    const ciudadRes = await axios.post(`${API_URL}/api/ciudades/find-or-create`, {
      nombreCiudad: nuevaLocalidad,
      codigoPostal: nuevoCp
    });
    
    console.log(`✅ Ciudad: ${ciudadRes.data.nombreCiudad} (CP: ${ciudadRes.data.codigoPostal})`);
    const idCiudad = ciudadRes.data.idCiudad;
    
    // 3. Crear o encontrar un barrio asociado a esa ciudad
    console.log('\n📍 3. Buscando/creando un barrio...');
    const barrioRes = await axios.post(`${API_URL}/api/barrios/find-or-create`, {
      nombreBarrio: clienteOriginal.barrio,
      idCiudad
    });
    
    console.log(`✅ Barrio: ${barrioRes.data.nombreBarrio}`);
    const idBarrio = barrioRes.data.idBarrio;
    
    // 4. Actualizar el cliente
    console.log('\n📝 4. Actualizando el cliente...');
    const clienteActualizado = {
      ...clienteOriginal,
      cp: nuevoCp,
      idCiudad,
      idBarrio
    };
    
    await axios.put(`${API_URL}/api/clientes/${clienteOriginal.id}`, clienteActualizado);
    console.log('✅ Cliente actualizado correctamente');
    
    // 5. Verificar que el cliente se actualizó
    console.log('\n🔍 5. Verificando que el cliente se actualizó...');
    const clienteVerificacion = await axios.get(`${API_URL}/api/clientes`);
    const clienteActualizadoEnBD = clienteVerificacion.data.find(c => c.id === clienteOriginal.id);
    
    if (clienteActualizadoEnBD && clienteActualizadoEnBD.cp === nuevoCp) {
      console.log('✅ Cliente verificado con el nuevo CP:', clienteActualizadoEnBD.cp);
    } else {
      console.log('❌ El CP del cliente no se actualizó correctamente');
      console.log('   CP esperado:', nuevoCp);
      console.log('   CP actual:', clienteActualizadoEnBD ? clienteActualizadoEnBD.cp : 'N/A');
    }
    
    console.log('\n✅ Test completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en test:', error.response?.data || error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
  }
}

testEdicionCliente();
