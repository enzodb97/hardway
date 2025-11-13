const { sequelize } = require('./config/database');

// Script mejorado: Asignar pedidos del estado 3 al picker que originalmente hizo el picking
// Si no hay historial, asigna a un picker por defecto
async function asignarPedidosPendientes() {
  try {
    console.log('🔍 Buscando pedidos en estado 3 (Abonado) sin asignación activa...\n');

    // Obtener pedidos con estado 3 que NO tienen asignación O tienen múltiples asignaciones antiguas
    const [pedidosSinAsignar] = await sequelize.query(`
      SELECT 
        p.numeroPedido,
        p.idEstado,
        p.fechaPedido
      FROM pedido p
      WHERE p.idEstado = 3 
        AND p.estaActivo = 1
        AND NOT EXISTS (
          SELECT 1 
          FROM asignacion_picking ap 
          WHERE ap.numeroPedido = p.numeroPedido 
            AND ap.completado = 1 
            AND ap.despachado = 0
        )
      ORDER BY p.fechaPedido DESC
      LIMIT 50
    `);

    console.log(`📦 Encontrados ${pedidosSinAsignar.length} pedidos para verificar\n`);

    if (pedidosSinAsignar.length === 0) {
      console.log('✅ No hay pedidos pendientes de asignación');
      console.log('Todos los pedidos en estado 3 ya tienen un picker asignado correctamente.\n');
      process.exit(0);
    }

    // Obtener picker por defecto (por si no hay historial)
    const [pickersPorDefecto] = await sequelize.query(`
      SELECT legajo, CONCAT(per.nombre, ' ', COALESCE(per.apellido, '')) AS nombreCompleto
      FROM encargadopicker ep
      JOIN persona per ON ep.idPersona = per.idPersona
      LIMIT 1
    `);

    if (pickersPorDefecto.length === 0) {
      console.log('❌ No hay pickers disponibles en el sistema');
      process.exit(1);
    }

    const pickerPorDefecto = pickersPorDefecto[0];
    console.log(`🔧 Picker por defecto (si no hay historial): ${pickerPorDefecto.nombreCompleto} (${pickerPorDefecto.legajo})\n`);
    console.log('='.repeat(80));

    let asignadosConHistorial = 0;
    let asignadosPorDefecto = 0;
    let yaAsignados = 0;

    // Procesar cada pedido
    for (const pedido of pedidosSinAsignar) {
      console.log(`\n📋 Procesando pedido: ${pedido.numeroPedido}`);

      // 1. Buscar si hay un historial de picking anterior para este pedido
      const [historial] = await sequelize.query(`
        SELECT 
          ap.legajoPicker,
          ap.fechaCompletado,
          ap.completado,
          CONCAT(per.nombre, ' ', COALESCE(per.apellido, '')) AS nombrePicker
        FROM asignacion_picking ap
        LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
        LEFT JOIN persona per ON ep.idPersona = per.idPersona
        WHERE ap.numeroPedido = ?
        ORDER BY ap.fechaAsignacion DESC, ap.idAsignacion DESC
        LIMIT 1
      `, {
        replacements: [pedido.numeroPedido]
      });

      let pickerAsignado;
      let nombrePicker;
      let motivo;

      if (historial.length > 0 && historial[0].legajoPicker) {
        // Caso 1: Ya existe un historial de picking
        const ultimaAsignacion = historial[0];
        
        if (ultimaAsignacion.completado === 1) {
          // Ya está completado, solo falta marcar para despacho
          console.log(`   ✅ Ya tiene asignación completada: ${ultimaAsignacion.nombrePicker}`);
          console.log(`   ℹ️  Solo se actualizará para permitir despacho`);
          
          // No necesita INSERT, ya está bien
          yaAsignados++;
          continue;
        } else {
          // Tiene asignación pero no completada - usar ese picker
          pickerAsignado = ultimaAsignacion.legajoPicker;
          nombrePicker = ultimaAsignacion.nombrePicker || pickerAsignado;
          motivo = `Reactivando asignación existente de ${nombrePicker}`;
          
          // Marcar la asignación existente como completada
          await sequelize.query(`
            UPDATE asignacion_picking
            SET completado = 1, 
                fechaCompletado = NOW(),
                observaciones = 'Marcado como completado automáticamente para permitir despacho'
            WHERE numeroPedido = ?
              AND legajoPicker = ?
              AND completado = 0
          `, {
            replacements: [pedido.numeroPedido, pickerAsignado]
          });
          
          console.log(`   ♻️  ${motivo}`);
          asignadosConHistorial++;
          continue;
        }
      } else {
        // Caso 2: No hay historial - usar picker por defecto
        pickerAsignado = pickerPorDefecto.legajo;
        nombrePicker = pickerPorDefecto.nombreCompleto;
        motivo = `Sin historial - asignado a ${nombrePicker} (por defecto)`;
        
        // Crear nueva asignación
        await sequelize.query(`
          INSERT INTO asignacion_picking 
          (numeroPedido, legajoPicker, fechaAsignacion, completado, despachado, fechaCompletado, observaciones)
          VALUES 
          (?, ?, NOW(), 1, 0, NOW(), 'Asignación automática - sin historial previo')
        `, {
          replacements: [pedido.numeroPedido, pickerAsignado]
        });
        
        console.log(`   🆕 ${motivo}`);
        asignadosPorDefecto++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMEN DE ASIGNACIONES:');
    console.log(`   ✅ Pedidos ya asignados correctamente: ${yaAsignados}`);
    console.log(`   ♻️  Pedidos con historial reactivados: ${asignadosConHistorial}`);
    console.log(`   🆕 Pedidos asignados por defecto: ${asignadosPorDefecto}`);
    console.log(`   📦 Total procesados: ${pedidosSinAsignar.length}`);
    
    console.log(`\n🎉 Proceso completado exitosamente`);
    console.log(`📋 Ahora todos los pedidos tienen el picker correcto asignado en el módulo de Envíos\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

asignarPedidosPendientes();
