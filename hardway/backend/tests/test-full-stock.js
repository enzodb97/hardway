const { sequelize } = require('../models');

async function testCompleteStockQuery() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida');
    
    // Probar + color
    let [result1] = await sequelize.query(`SELECT COUNT(*) as count FROM movimientostock ms 
      JOIN stock s ON ms.idStock = s.idStock 
      JOIN rack r ON s.idRack = r.idRack 
      JOIN indumentaria i ON s.codigoIndumentaria = i.codigoIndumentaria 
      JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle 
      JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre 
      JOIN talle ta ON di.idTalle = ta.idTalle 
      JOIN color co ON di.idColor = co.idColor LIMIT 1`);
    console.log('✓ + color:', result1[0].count, 'registros');

    // Probar + tela
    let [result2] = await sequelize.query(`SELECT COUNT(*) as count FROM movimientostock ms 
      JOIN stock s ON ms.idStock = s.idStock 
      JOIN rack r ON s.idRack = r.idRack 
      JOIN indumentaria i ON s.codigoIndumentaria = i.codigoIndumentaria 
      JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle 
      JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre 
      JOIN talle ta ON di.idTalle = ta.idTalle 
      JOIN color co ON di.idColor = co.idColor 
      JOIN tela te ON di.idTela = te.idTela LIMIT 1`);
    console.log('✓ + tela:', result2[0].count, 'registros');

    console.log('\n¡Todas las relaciones funcionan! Probando consulta completa...');

    // Ahora probar la consulta completa
    const [result] = await sequelize.query(`
      SELECT
          i.codigoIndumentaria AS codigo,
          ni.nombre AS producto,
          ta.talle,
          co.color,
          te.tipoTela AS tela,
          r.numeroRack AS rack,
          SUM(ms.cantidad) AS stock_actual
      FROM
          movimientostock ms
      JOIN
          stock s ON ms.idStock = s.idStock
      JOIN
          rack r ON s.idRack = r.idRack
      JOIN
          indumentaria i ON s.codigoIndumentaria = i.codigoIndumentaria
      JOIN
          detalleindumentaria di ON i.idDetalle = di.idDetalle
      JOIN
          nombreindumentaria ni ON di.idNombre = ni.idNombre
      JOIN
          talle ta ON di.idTalle = ta.idTalle
      JOIN
          color co ON di.idColor = co.idColor
      JOIN
          tela te ON di.idTela = te.idTela
      GROUP BY
          i.codigoIndumentaria,
          ni.nombre,
          ta.talle,
          co.color,
          te.tipoTela,
          r.numeroRack
      ORDER BY
          stock_actual DESC
      LIMIT 5
    `);

    console.log('\n✓ Consulta completa exitosa! Primeros 5 resultados:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testCompleteStockQuery();
