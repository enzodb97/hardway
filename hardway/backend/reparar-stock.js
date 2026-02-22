// Script para reparar registros de stock corruptos
// Ejecutar con: node reparar-stock.js

const { sequelize } = require('./models');

async function repararStocksCorruptos() {
  const t = await sequelize.transaction();
  
  try {
    console.log('🔧 Iniciando reparación de stocks corruptos...\n');

    // Buscar todos los registros de stock con idStock que indique rack 99 pero tenga idRack diferente
    const [stocksCorruptos] = await sequelize.query(`
      SELECT 
        idStock, 
        codigoIndumentaria, 
        idRack 
      FROM stock 
      WHERE (
        idStock LIKE '%STK-NA-%' 
        OR idStock LIKE '%-R99-%'
      ) 
      AND idRack != 99
    `, { transaction: t });

    console.log(`🔍 Encontrados ${stocksCorruptos.length} registros corruptos\n`);

    if (stocksCorruptos.length === 0) {
      console.log('✅ No se encontraron registros corruptos. La base de datos está limpia.\n');
      await t.commit();
      process.exit(0);
    }

    // Mostrar registros encontrados
    console.log('📋 Registros que serán reparados:');
    console.log('─'.repeat(80));
    stocksCorruptos.forEach(stock => {
      console.log(`  • ${stock.idStock}`);
      console.log(`    Indumentaria: ${stock.codigoIndumentaria}`);
      console.log(`    Rack actual (incorrecto): ${stock.idRack} → Será corregido a: 99`);
      console.log('');
    });

    // Reparar cada registro
    console.log('🔧 Aplicando correcciones...\n');
    for (const stock of stocksCorruptos) {
      await sequelize.query(`
        UPDATE stock 
        SET idRack = 99 
        WHERE idStock = ?
      `, {
        replacements: [stock.idStock],
        transaction: t
      });

      console.log(`  ✓ Reparado: ${stock.idStock} (${stock.codigoIndumentaria})`);
    }

    await t.commit();
    
    console.log('\n✅ Reparación completada exitosamente!');
    console.log(`📊 Total de registros corregidos: ${stocksCorruptos.length}\n`);
    
    process.exit(0);
  } catch (error) {
    await t.rollback();
    console.error('\n❌ Error al reparar stocks corruptos:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

// Ejecutar la reparación
repararStocksCorruptos();
