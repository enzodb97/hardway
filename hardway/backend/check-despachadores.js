const { sequelize } = require('./config/database');

// Verificar pedidos con estado 3 y sus asignaciones
const query1 = `
SELECT 
  p.numeroPedido, 
  p.idEstado, 
  ap.legajoPicker, 
  ap.completado,
  ap.despachado,
  CONCAT(per.nombre, ' ', COALESCE(per.apellido, '')) AS nombrePicker
FROM pedido p
LEFT JOIN asignacion_picking ap ON p.numeroPedido = ap.numeroPedido 
  AND ap.idAsignacion = (
    SELECT MAX(ap2.idAsignacion) 
    FROM asignacion_picking ap2 
    WHERE ap2.numeroPedido = ap.numeroPedido
  )
LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
LEFT JOIN persona per ON ep.idPersona = per.idPersona
WHERE p.idEstado IN (3, 4) AND p.estaActivo = 1
LIMIT 10
`;

// Verificar asignaciones de picking completadas
const query2 = `
SELECT 
  ap.numeroPedido,
  ap.legajoPicker,
  ap.completado,
  ap.despachado,
  ap.fechaCompletado,
  p.idEstado,
  CONCAT(per.nombre, ' ', COALESCE(per.apellido, '')) AS nombrePicker
FROM asignacion_picking ap
JOIN pedido p ON ap.numeroPedido = p.numeroPedido
LEFT JOIN encargadopicker ep ON ap.legajoPicker = ep.legajo
LEFT JOIN persona per ON ep.idPersona = per.idPersona
WHERE ap.completado = 1 AND p.estaActivo = 1
ORDER BY ap.fechaCompletado DESC
LIMIT 10
`;

async function verificar() {
  try {
    console.log('=================================');
    console.log('📦 PEDIDOS CON ESTADO 3 o 4:');
    console.log('=================================\n');
    
    const [results1] = await sequelize.query(query1);
    console.log('Total:', results1.length);
    console.log('');
    results1.forEach(p => {
      console.log(`Pedido: ${p.numeroPedido}`);
      console.log(`  Estado: ${p.idEstado}`);
      console.log(`  Legajo: ${p.legajoPicker || 'NO ASIGNADO'}`);
      console.log(`  Picker: ${p.nombrePicker || 'NO ASIGNADO'}`);
      console.log(`  Completado: ${p.completado}`);
      console.log(`  Despachado: ${p.despachado}`);
      console.log('');
    });

    console.log('\n=================================');
    console.log('✅ ASIGNACIONES COMPLETADAS:');
    console.log('=================================\n');
    
    const [results2] = await sequelize.query(query2);
    console.log('Total de asignaciones completadas:', results2.length);
    console.log('');
    results2.forEach(a => {
      console.log(`Pedido: ${a.numeroPedido}`);
      console.log(`  Estado del pedido: ${a.idEstado}`);
      console.log(`  Legajo: ${a.legajoPicker}`);
      console.log(`  Picker: ${a.nombrePicker}`);
      console.log(`  Completado: ${a.completado}`);
      console.log(`  Despachado: ${a.despachado}`);
      console.log(`  Fecha completado: ${a.fechaCompletado}`);
      console.log('');
    });

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

verificar();
