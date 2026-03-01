/**
 * Script para ejecutar las migraciones de snapshot en detallepedido
 * 
 * Este script:
 * 1. Agrega las columnas de snapshot a la tabla detallepedido
 * 2. Migra los datos existentes con los valores actuales de las tablas relacionadas
 * 
 * Uso: node ejecutar-migracion-snapshot.js
 */

const { sequelize } = require('./config/database');

async function ejecutarMigracion() {
  console.log('📦 Iniciando migración de snapshot para detallepedido...\n');
  
  try {
    // Paso 1: Agregar columnas individualmente
    console.log('🔧 Paso 1: Agregando columnas de snapshot...');
    
    // Lista de columnas a agregar (una por una para manejar errores individualmente)
    const columnas = [
      "ADD COLUMN nombreProducto VARCHAR(100) DEFAULT NULL COMMENT 'Nombre del producto al momento del pedido'",
      "ADD COLUMN colorProducto VARCHAR(50) DEFAULT NULL COMMENT 'Color del producto al momento del pedido'",
      "ADD COLUMN talleProducto VARCHAR(20) DEFAULT NULL COMMENT 'Talle del producto al momento del pedido'",
      "ADD COLUMN categoriaProducto VARCHAR(50) DEFAULT NULL COMMENT 'Categoría del producto al momento del pedido'",
      "ADD COLUMN telaProducto VARCHAR(50) DEFAULT NULL COMMENT 'Tela del producto al momento del pedido'",
      "ADD COLUMN precioUnitario DECIMAL(10,2) DEFAULT NULL COMMENT 'Precio unitario al momento del pedido'",
      "ADD COLUMN nombrePresentacion VARCHAR(50) DEFAULT NULL COMMENT 'Nombre de la presentación al momento del pedido'"
    ];
    
    for (const columna of columnas) {
      try {
        await sequelize.query(`ALTER TABLE detallepedido ${columna}`);
        const nombreCol = columna.match(/ADD COLUMN (\w+)/)[1];
        console.log(`  ✅ Columna agregada: ${nombreCol}`);
      } catch (error) {
        // Si el error es que la columna ya existe, continuar
        if (error.message.includes('Duplicate column') || 
            error.message.includes('already exists')) {
          const nombreCol = columna.match(/ADD COLUMN (\w+)/)[1];
          console.log(`  ⚠️  Columna ya existe: ${nombreCol}`);
        } else {
          throw error;
        }
      }
    }
    
    // Agregar índice si no existe
    try {
      await sequelize.query('CREATE INDEX idx_detallepedido_numeropedido ON detallepedido(numeroPedido)');
      console.log('  ✅ Índice creado: idx_detallepedido_numeropedido');
    } catch (error) {
      if (error.message.includes('Duplicate key') || error.message.includes('already exists')) {
        console.log('  ⚠️  Índice ya existe: idx_detallepedido_numeropedido');
      } else {
        // No es crítico si falla el índice
        console.log('  ⚠️  No se pudo crear el índice (puede que ya exista)');
      }
    }
    
    console.log('\n✅ Columnas agregadas exitosamente\n');
    
    // Verificar que las columnas se agregaron correctamente
    console.log('🔍 Verificando estructura de la tabla...');
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'detallepedido' 
      AND COLUMN_NAME IN ('nombreProducto', 'colorProducto', 'talleProducto', 
                          'categoriaProducto', 'telaProducto', 'precioUnitario', 
                          'nombrePresentacion')
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (columns.length < 7) {
      throw new Error(`Solo se encontraron ${columns.length} de 7 columnas esperadas. Migración incompleta.`);
    }
    console.log(`  ✅ Se verificaron ${columns.length} columnas nuevas\n`);
    
    // Paso 2: Migrar datos existentes
    console.log('🔧 Paso 2: Migrando datos existentes...');
    
    const updateQuery = `
      UPDATE detallepedido dp
      JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
      LEFT JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre
      LEFT JOIN precioindumentaria pr ON di.idPrecio = pr.idPrecio
      LEFT JOIN color co ON di.idColor = co.idColor
      LEFT JOIN talle ta ON di.idTalle = ta.idTalle
      LEFT JOIN categoriaindumentaria cat ON di.idCategoria = cat.idCategoria
      LEFT JOIN tela te ON di.idTela = te.idTela
      LEFT JOIN presentacion_producto pp ON dp.idPresentacion = pp.idPresentacion
      SET 
        dp.nombreProducto = ni.nombre,
        dp.colorProducto = co.color,
        dp.talleProducto = ta.talle,
        dp.categoriaProducto = cat.categoria,
        dp.telaProducto = te.tipoTela,
        dp.precioUnitario = pr.precio,
        dp.nombrePresentacion = pp.nombrePresentacion
      WHERE 
        dp.nombreProducto IS NULL
    `;
    
    const result = await sequelize.query(updateQuery);
    console.log(`  ✅ Migrados registros exitosamente`);
    
    console.log('\n✅ Migración de datos completada\n');
    
    // Verificar resultados
    console.log('🔍 Verificando resultados...');
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN nombreProducto IS NOT NULL THEN 1 ELSE 0 END) as con_snapshot,
        SUM(CASE WHEN nombreProducto IS NULL THEN 1 ELSE 0 END) as sin_snapshot
      FROM detallepedido
    `);
    
    console.log('📊 Estadísticas:');
    console.log(`  Total de registros: ${results[0].total}`);
    console.log(`  Con snapshot: ${results[0].con_snapshot}`);
    console.log(`  Sin snapshot: ${results[0].sin_snapshot}`);
    
    // Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de registros migrados:');
    const [ejemplos] = await sequelize.query(`
      SELECT 
        idDetallePedido,
        codigoIndumentaria,
        nombreProducto,
        precioUnitario,
        colorProducto,
        talleProducto
      FROM detallepedido
      WHERE nombreProducto IS NOT NULL
      LIMIT 5
    `);
    
    ejemplos.forEach((ej, idx) => {
      console.log(`  ${idx + 1}. ${ej.codigoIndumentaria} - ${ej.nombreProducto} ($${ej.precioUnitario}) - ${ej.colorProducto}/${ej.talleProducto}`);
    });
    
    console.log('\n✅ ¡Migración completada exitosamente!\n');
    console.log('📝 Nota: Los valores migrados reflejan el estado ACTUAL de los productos,');
    console.log('   no el estado histórico al momento del pedido (no disponible).\n');
    console.log('   Los nuevos pedidos guardarán los datos correctos automáticamente.');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar migración
ejecutarMigracion();
