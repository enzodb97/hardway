/**
 * Script de verificación pre-migración
 * 
 * Verifica que la base de datos esté correctamente configurada
 * antes de ejecutar la migración de snapshot
 * 
 * Uso: node verificar-bd-pre-migracion.js
 */

const { sequelize } = require('./config/database');

async function verificarBaseDatos() {
  console.log('🔍 ===== VERIFICACIÓN PRE-MIGRACIÓN =====\n');
  
  try {
    // 1. Verificar conexión a la base de datos
    console.log('📡 Paso 1: Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('  ✅ Conexión exitosa\n');
    
    // 2. Verificar que existe la tabla detallepedido
    console.log('📋 Paso 2: Verificando tabla detallepedido...');
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'detallepedido'
    `);
    
    if (tables.length === 0) {
      throw new Error('❌ La tabla detallepedido no existe en la base de datos');
    }
    console.log('  ✅ Tabla detallepedido existe\n');
    
    // 3. Verificar estructura actual
    console.log('🏗️  Paso 3: Verificando estructura actual...');
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'detallepedido' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('  📊 Columnas actuales:');
    columns.forEach(col => {
      console.log(`     - ${col.COLUMN_NAME} (${col.COLUMN_TYPE})`);
    });
    console.log();
    
    // 4. Verificar si las columnas nuevas ya existen
    const columnasNuevas = ['nombreProducto', 'colorProducto', 'talleProducto', 
                             'categoriaProducto', 'telaProducto', 'precioUnitario', 
                             'nombrePresentacion'];
    
    const columnasExistentes = columns.map(c => c.COLUMN_NAME);
    const columnasYaAgregadas = columnasNuevas.filter(c => columnasExistentes.includes(c));
    
    if (columnasYaAgregadas.length > 0) {
      console.log('⚠️  Paso 4: Algunas columnas ya existen:');
      columnasYaAgregadas.forEach(col => {
        console.log(`     - ${col} (ya existe)`);
      });
      console.log('  ℹ️  La migración omitirá estas columnas\n');
    } else {
      console.log('✅ Paso 4: Ninguna columna de snapshot existe aún (correcto)\n');
    }
    
    // 5. Verificar tablas relacionadas necesarias para la migración
    console.log('🔗 Paso 5: Verificando tablas relacionadas...');
    const tablasRequeridas = [
      'indumentaria',
      'detalleindumentaria',
      'nombreindumentaria',
      'precioindumentaria',
      'color',
      'talle',
      'categoriaindumentaria',
      'tela',
      'presentacion_producto'
    ];
    
    const [tablasExistentes] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN (${tablasRequeridas.map(t => `'${t}'`).join(',')})
    `);
    
    const nombresExistentes = tablasExistentes.map(t => t.TABLE_NAME);
    const tablasFaltantes = tablasRequeridas.filter(t => !nombresExistentes.includes(t));
    
    if (tablasFaltantes.length > 0) {
      console.log('  ❌ Faltan tablas requeridas:');
      tablasFaltantes.forEach(t => console.log(`     - ${t}`));
      throw new Error('Base de datos incompleta');
    }
    
    console.log('  ✅ Todas las tablas relacionadas existen\n');
    
    // 6. Verificar registros en detallepedido
    console.log('📊 Paso 6: Verificando datos en detallepedido...');
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total FROM detallepedido
    `);
    
    const totalRegistros = countResult[0].total;
    console.log(`  ℹ️  Total de registros: ${totalRegistros}`);
    
    if (totalRegistros === 0) {
      console.log('  ⚠️  No hay registros para migrar (la tabla está vacía)\n');
    } else {
      console.log(`  ✅ Se migrarán ${totalRegistros} registros\n`);
    }
    
    // 7. Verificar integridad referencial (sample)
    console.log('🔍 Paso 7: Verificando integridad referencial (muestra)...');
    const [sampleCheck] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN i.codigoIndumentaria IS NULL THEN 1 ELSE 0 END) as sin_indumentaria
      FROM detallepedido dp
      LEFT JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
      LIMIT 1000
    `);
    
    if (sampleCheck[0].sin_indumentaria > 0) {
      console.log(`  ⚠️  Advertencia: ${sampleCheck[0].sin_indumentaria} registros sin indumentaria relacionada`);
      console.log('     (estos registros no se podrán migrar completamente)\n');
    } else {
      console.log('  ✅ Integridad referencial correcta\n');
    }
    
    // 8. Verificar permisos
    console.log('🔐 Paso 8: Verificando permisos de usuario...');
    try {
      // Intentar un ALTER TABLE en una tabla temporal
      await sequelize.query('CREATE TEMPORARY TABLE test_permisos (id INT)');
      await sequelize.query('ALTER TABLE test_permisos ADD COLUMN test VARCHAR(10)');
      await sequelize.query('DROP TEMPORARY TABLE test_permisos');
      console.log('  ✅ Usuario tiene permisos ALTER TABLE\n');
    } catch (error) {
      console.log('  ❌ Usuario NO tiene permisos ALTER TABLE');
      throw new Error('Permisos insuficientes para ejecutar la migración');
    }
    
    // 9. Verificar versión de MySQL/MariaDB
    console.log('🗄️  Paso 9: Verificando versión del servidor...');
    const [versionResult] = await sequelize.query('SELECT VERSION() as version');
    const version = versionResult[0].version;
    console.log(`  ℹ️  Versión: ${version}\n`);
    
    // Resumen final
    console.log('═══════════════════════════════════════════');
    console.log('✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('📋 Resumen:');
    console.log(`   • Tabla detallepedido: OK`);
    console.log(`   • Registros a migrar: ${totalRegistros}`);
    console.log(`   • Columnas por agregar: ${7 - columnasYaAgregadas.length}`);
    console.log(`   • Tablas relacionadas: OK`);
    console.log(`   • Permisos: OK`);
    console.log(`   • Versión DB: ${version}\n`);
    
    if (columnasYaAgregadas.length === 7) {
      console.log('⚠️  IMPORTANTE: Todas las columnas ya existen.');
      console.log('   La migración solo actualizará los datos.\n');
    } else if (columnasYaAgregadas.length > 0) {
      console.log('⚠️  IMPORTANTE: Algunas columnas ya existen.');
      console.log('   La migración agregará las faltantes y actualizará los datos.\n');
    }
    
    console.log('💡 Siguiente paso:');
    console.log('   Ejecuta: node ejecutar-migracion-snapshot.js\n');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA VERIFICACIÓN:', error.message);
    console.error('\n🔧 Por favor, corrige los problemas antes de ejecutar la migración.\n');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarBaseDatos();
