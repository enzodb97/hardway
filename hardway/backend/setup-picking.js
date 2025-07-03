const { sequelize } = require('./models');

async function setupPickingData() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida');
    
    // Verificar si existen pickers
    const [pickers] = await sequelize.query('SELECT COUNT(*) as count FROM encargadopicker');
    console.log('Pickers en la BD:', pickers[0].count);
    
    if (pickers[0].count === 0) {
      console.log('No hay pickers, creando datos de prueba...');
      
      // Crear algunos pickers de prueba basados en usuarios existentes
      const [usuariosPicker] = await sequelize.query(`
        SELECT u.nombreUsuario, u.idPersona 
        FROM usuario u 
        WHERE u.tipoRol = 'Picker' 
        LIMIT 3
      `);
      
      if (usuariosPicker.length > 0) {
        for (let i = 0; i < usuariosPicker.length; i++) {
          const usuario = usuariosPicker[i];
          const legajo = `P00${i + 1}`;
          
          try {
            await sequelize.query(`
              INSERT INTO encargadopicker (legajo, idPersona) 
              VALUES (?, ?)
            `, { replacements: [legajo, usuario.idPersona] });
            
            console.log(`✓ Picker creado: ${legajo} para usuario ${usuario.nombreUsuario}`);
          } catch (error) {
            console.log(`- Picker ${legajo} ya existe o error:`, error.message);
          }
        }
      }
    }
    
    // Mostrar pickers disponibles
    const [pickersFinales] = await sequelize.query(`
      SELECT 
        ep.legajo,
        u.nombreUsuario,
        CONCAT(p.nombre, ' ', COALESCE(p.apellido, '')) AS nombreCompleto
      FROM encargadopicker ep
      LEFT JOIN usuario u ON ep.idPersona = u.idPersona  
      LEFT JOIN persona p ON ep.idPersona = p.idPersona
    `);
    
    console.log('\nPickers disponibles:');
    pickersFinales.forEach(picker => {
      console.log(`- ${picker.legajo}: ${picker.nombreCompleto} (${picker.nombreUsuario})`);
    });
    
    // Verificar asignaciones de picking
    const [asignaciones] = await sequelize.query('SELECT COUNT(*) as count FROM asignacion_picking');
    console.log('\nAsignaciones de picking:', asignaciones[0].count);
    
    if (asignaciones[0].count === 0) {
      console.log('No hay asignaciones, creando datos de prueba...');
      
      // Obtener algunos pedidos para crear asignaciones
      const [pedidos] = await sequelize.query(`
        SELECT numeroPedido 
        FROM pedido 
        WHERE estaActivo = 1 
        LIMIT 3
      `);
      
      if (pedidos.length > 0 && pickersFinales.length > 0) {
        for (let i = 0; i < Math.min(pedidos.length, pickersFinales.length); i++) {
          try {
            await sequelize.query(`
              INSERT INTO asignacion_picking (numeroPedido, legajoPicker, fechaAsignacion, completado, observaciones) 
              VALUES (?, ?, datetime('now'), 0, 'Asignación de prueba')
            `, { replacements: [pedidos[i].numeroPedido, pickersFinales[i].legajo] });
            
            console.log(`✓ Asignación creada: Pedido ${pedidos[i].numeroPedido} -> Picker ${pickersFinales[i].legajo}`);
          } catch (error) {
            console.log(`- Error creando asignación:`, error.message);
          }
        }
      }
    }
    
    console.log('\n✓ Setup de picking completado');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

setupPickingData();
