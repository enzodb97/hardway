const { sequelize } = require('../models');

async function testStockSQL() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida');
    
    // Probar la consulta SQL directamente
    const query = `
      SELECT
          s.codigoIndumentaria AS codigo,
          'Producto genérico' AS producto,
          'M' AS talle,
          'Negro' AS color,
          'Algodón' AS tela,
          r.numeroRack AS rack,
          SUM(ms.cantidad) AS stock_actual
      FROM
          movimientostock ms
      JOIN
          stock s ON ms.idStock = s.idStock
      JOIN
          rack r ON s.idRack = r.idRack
      GROUP BY
          s.codigoIndumentaria,
          r.numeroRack
      ORDER BY
          stock_actual DESC
      LIMIT 20
    `;

    console.log('Ejecutando consulta SQL...');
    const [result] = await sequelize.query(query);
    console.log('Resultado de la consulta:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error en consulta SQL:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testStockSQL();
