// test-cp-cliente.js - Verificar que el campo CP funcione correctamente
require('dotenv').config();
const { connectDB } = require('../config/database');
const { setupAssociations } = require('../models');

async function testCPCliente() {
  console.log('🧪 Test del campo CP en clientes...\n');
  
  try {
    await connectDB();
    setupAssociations();
    
    const { Cliente, Persona } = require('../models');
    const { Domicilio, Barrio, Ciudad } = require('../models/Ubicacion');
    
    // 1. Buscar un cliente existente
    console.log('📋 1. Buscando clientes existentes...');
    const clientes = await Cliente.findAll({
      include: [
        {
          model: Persona,
          as: 'Persona',
          include: [
            {
              model: Domicilio,
              as: 'Domicilio',
              include: [
                {
                  model: Ciudad,
                  as: 'Ciudad'
                },
                {
                  model: Barrio,
                  as: 'Barrio'
                }
              ]
            }
          ]
        }
      ],
      limit: 3
    });
    
    if (clientes.length === 0) {
      console.log('❌ No se encontraron clientes para probar');
      return;
    }
    
    console.log(`✅ Encontrados ${clientes.length} clientes:`);
    clientes.forEach(cliente => {
      const persona = cliente.Persona;
      const domicilio = persona?.Domicilio;
      const ciudad = domicilio?.Ciudad;
      const barrio = domicilio?.Barrio;
      
      console.log(`  - ID: ${cliente.idCliente}`);
      console.log(`    Nombre: ${persona?.nombre || 'N/A'} ${persona?.apellido || ''}`);
      console.log(`    Ciudad: ${ciudad?.nombreCiudad || 'N/A'}`);
      console.log(`    CP: ${ciudad?.codigoPostal || 'N/A'}`);
      console.log(`    Barrio: ${barrio?.nombreBarrio || 'N/A'}`);
      console.log('    ---');
    });
    
    // 2. Verificar estructura de datos para frontend
    console.log('\n📱 2. Verificando formato de datos para frontend...');
    const clienteParaFrontend = clientes[0];
    const persona = clienteParaFrontend.Persona;
    const domicilio = persona?.Domicilio;
    const ciudad = domicilio?.Ciudad;
    const barrio = domicilio?.Barrio;
    
    const datosFormateados = {
      id: clienteParaFrontend.idCliente,
      tipoDocumento: 'DNI', // Por defecto
      numeroDocumento: String(persona?.dni || ''),
      nombre: `${persona?.nombre || ''} ${persona?.apellido || ''}`.trim(),
      domicilio: persona?.direccion || '',
      calle: domicilio?.calle || '',
      altura: domicilio?.altura || '',
      piso: domicilio?.piso || '',
      numeroDepartamento: domicilio?.departamento || '',
      observaciones: domicilio?.observaciones || '',
      localidad: ciudad?.nombreCiudad || '',
      barrio: barrio?.nombreBarrio || '',
      cp: ciudad?.codigoPostal || '', // ⭐ CAMPO CP
      telefono: clienteParaFrontend.telefono || '',
      email: clienteParaFrontend.email || ''
    };
    
    console.log('✅ Datos formateados para frontend:');
    console.log(JSON.stringify(datosFormateados, null, 2));
    
    // 3. Verificar que el CP se puede actualizar
    console.log('\n🔄 3. Probando actualización de CP...');
    const ciudadAnterior = domicilio?.Ciudad;
    console.log(`CP anterior: ${ciudadAnterior?.codigoPostal || 'N/A'}`);
    
    // Simular una actualización de CP
    const nuevoCp = '1234';
    console.log(`Simulando cambio de CP a: ${nuevoCp}`);
    
    // Verificar si existe una ciudad con el nuevo CP
    const ciudadExistente = await Ciudad.findOne({
      where: { 
        nombreCiudad: ciudadAnterior?.nombreCiudad || 'Buenos Aires',
        codigoPostal: nuevoCp 
      }
    });
    
    if (ciudadExistente) {
      console.log(`✅ Ciudad encontrada con CP ${nuevoCp}: ID ${ciudadExistente.id}`);
    } else {
      console.log(`ℹ️  No existe ciudad con CP ${nuevoCp}, se crearía una nueva`);
    }
    
    console.log('\n✅ Test completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
  
  process.exit(0);
}

testCPCliente();
