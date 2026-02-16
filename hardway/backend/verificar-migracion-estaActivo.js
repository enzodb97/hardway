// Script para verificar y corregir migración de estaActivo
const { sequelize } = require('./config/database');

async function verificarYCorregirMigracion() {
  try {
    console.log('🔍 Verificando migración de estaActivo...\n');
    
    // 1. Verificar estructura de la tabla
    console.log('1️⃣ Estructura de tabla usuario:');
    const [columns] = await sequelize.query("DESCRIBE usuario");
    console.table(columns);
    
    const tieneEstaActivo = columns.some(col => col.Field === 'estaActivo');
    
    if (!tieneEstaActivo) {
      console.log('\n❌ La columna estaActivo NO existe. Ejecutando migración...\n');
      
      await sequelize.query(`
        ALTER TABLE usuario 
        ADD COLUMN estaActivo TINYINT(1) NOT NULL DEFAULT 1 
        COMMENT 'Indica si el usuario está activo (1) o inactivo (0)'
      `);
      
      console.log('✅ Columna estaActivo creada\n');
    } else {
      console.log('\n✅ La columna estaActivo existe\n');
    }
    
    // 2. Actualizar usuarios existentes
    console.log('2️⃣ Actualizando usuarios con estaActivo NULL...');
    const [updateResult] = await sequelize.query(`
      UPDATE usuario 
      SET estaActivo = 1 
      WHERE estaActivo IS NULL
    `);
    console.log(`✅ ${updateResult.affectedRows} usuario(s) actualizado(s)\n`);
    
    // 3. Verificar estado de usuarios
    console.log('3️⃣ Estado de usuarios:');
    const [usuarios] = await sequelize.query(`
      SELECT 
        idUsuario,
        nombreUsuario,
        estaActivo,
        CASE 
          WHEN estaActivo = 1 THEN 'ACTIVO'
          WHEN estaActivo = 0 THEN 'INACTIVO'
          ELSE 'DESCONOCIDO'
        END AS estado_texto
      FROM usuario
      ORDER BY idUsuario
    `);
    console.table(usuarios);
    
    console.log('\n✅ Migración verificada y completada exitosamente!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verificarYCorregirMigracion();
