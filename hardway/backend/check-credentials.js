const { sequelize } = require('./models');

async function checkCredentials() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión establecida');
    
    console.log('=== VERIFICACIÓN DE ESTRUCTURA DE TABLA ===\n');
    
    // Verificar la estructura de la tabla usuario (MySQL)
    const [estructura] = await sequelize.query(`DESCRIBE usuario`);
    console.log('Estructura tabla usuario:');
    estructura.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });
    
    console.log('\n=== USUARIOS EN LA BASE DE DATOS ===\n');
    
    // Obtener todos los usuarios
    const [usuarios] = await sequelize.query(`
      SELECT * FROM usuario LIMIT 10
    `);
    
    console.log('Usuarios encontrados:');
    usuarios.forEach((user, index) => {
      console.log(`Usuario ${index + 1}:`);
      Object.keys(user).forEach(key => {
        console.log(`  ${key}: "${user[key]}"`);
      });
      console.log('  ---');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkCredentials();
