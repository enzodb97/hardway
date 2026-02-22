// Script para verificar el estado de los stocks
// Ejecutar con: node verificar-stock.js

const { sequelize } = require('./models');

async function verificarStocks() {
  try {
    console.log('🔍 VERIFICACIÓN DEL ESTADO DE STOCKS\n');
    console.log('═'.repeat(80));

    // 1. Verificar stocks con IDs sospechosos en racks incorrectos
    console.log('\n1️⃣  BUSCANDO STOCKS CORRUPTOS (IDs de rack 99 en otros racks)...\n');
    
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
    `);

    if (stocksCorruptos.length > 0) {
      console.log(`⚠️  ENCONTRADOS ${stocksCorruptos.length} REGISTROS CORRUPTOS:\n`);
      stocksCorruptos.forEach(stock => {
        console.log(`  ❌ ${stock.idStock}`);
        console.log(`     Indumentaria: ${stock.codigoIndumentaria}`);
        console.log(`     Rack actual: ${stock.idRack} (DEBERÍA SER 99)`);
        console.log('');
      });
    } else {
      console.log('✅ No se encontraron registros corruptos\n');
    }

    // 2. Mostrar todos los stocks del rack 99
    console.log('─'.repeat(80));
    console.log('\n2️⃣  STOCKS EN RACK 99 (No Aptas / Cuarentena)...\n');
    
    const [stocksRack99] = await sequelize.query(`
      SELECT 
        s.idStock, 
        s.codigoIndumentaria, 
        s.idRack,
        SUM(ms.cantidad) as stockDisponible
      FROM stock s
      LEFT JOIN movimientostock ms ON s.idStock = ms.idStock
      WHERE s.idRack = 99
      GROUP BY s.idStock, s.codigoIndumentaria, s.idRack
    `);

    if (stocksRack99.length > 0) {
      console.log(`📦 Total de stocks en rack 99: ${stocksRack99.length}\n`);
      stocksRack99.forEach(stock => {
        console.log(`  ${stock.stockDisponible > 0 ? '✓' : '○'} ${stock.idStock}`);
        console.log(`     Indumentaria: ${stock.codigoIndumentaria}`);
        console.log(`     Stock disponible: ${stock.stockDisponible || 0} unidades`);
        console.log('');
      });
    } else {
      console.log('📭 No hay stocks en rack 99\n');
    }

    // 3. Verificar estado específico de IND001
    console.log('─'.repeat(80));
    console.log('\n3️⃣  ESTADO DETALLADO DE IND001...\n');
    
    const [stocksIND001] = await sequelize.query(`
      SELECT 
        s.idStock, 
        s.codigoIndumentaria, 
        s.idRack,
        r.numeroRack,
        r.descripcion as descripcionRack
      FROM stock s
      LEFT JOIN rack r ON s.idRack = r.idRack
      WHERE s.codigoIndumentaria = 'IND001'
      ORDER BY s.idRack
    `);

    if (stocksIND001.length > 0) {
      console.log(`📊 IND001 tiene ${stocksIND001.length} registro(s) de stock:\n`);
      
      for (const stock of stocksIND001) {
        console.log(`  Stock ID: ${stock.idStock}`);
        console.log(`  Rack: ${stock.numeroRack || 'Sin asignar'} (ID: ${stock.idRack || 'NULL'})`);
        console.log(`  Descripción: ${stock.descripcionRack || 'N/A'}`);
        
        // Obtener movimientos de este stock
        const [movimientos] = await sequelize.query(`
          SELECT 
            idMovimientoStock,
            cantidad,
            fechaMovimiento,
            observaciones
          FROM movimientostock
          WHERE idStock = ?
          ORDER BY fechaMovimiento DESC
          LIMIT 5
        `, {
          replacements: [stock.idStock]
        });

        const totalStock = movimientos.reduce((sum, mov) => sum + (mov.cantidad || 0), 0);
        console.log(`  Stock disponible: ${totalStock} unidades`);
        
        if (movimientos.length > 0) {
          console.log(`  Últimos movimientos:`);
          movimientos.slice(0, 3).forEach(mov => {
            console.log(`    • ${mov.cantidad > 0 ? '+' : ''}${mov.cantidad} unidades - ${mov.observaciones || 'Sin observación'}`);
          });
        }
        console.log('');
      }
    } else {
      console.log('❌ No se encontró IND001 en la base de datos\n');
    }

    // 4. Resumen general
    console.log('═'.repeat(80));
    console.log('\n📋 RESUMEN:\n');
    
    const [totalStocks] = await sequelize.query(`
      SELECT COUNT(*) as total FROM stock
    `);
    
    const [stocksVendibles] = await sequelize.query(`
      SELECT COUNT(*) as total FROM stock WHERE idRack != 99 AND idRack IS NOT NULL
    `);

    console.log(`  • Total de registros en tabla stock: ${totalStocks[0].total}`);
    console.log(`  • Stocks vendibles (rack != 99): ${stocksVendibles[0].total}`);
    console.log(`  • Stocks en cuarentena (rack 99): ${stocksRack99.length}`);
    console.log(`  • Stocks corruptos encontrados: ${stocksCorruptos.length}`);
    
    if (stocksCorruptos.length === 0) {
      console.log('\n✅ ¡Todo está correcto! No hay registros corruptos.\n');
    } else {
      console.log('\n⚠️  Hay registros corruptos. Ejecuta: node reparar-stock.js\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al verificar stocks:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

// Ejecutar la verificación
verificarStocks();
