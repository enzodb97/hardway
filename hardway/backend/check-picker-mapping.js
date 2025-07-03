const { sequelize } = require('./models');

async function checkPickerMapping() {
  try {
    console.log('Verificando mapeo usuario-picker...');
    
    const [result] = await sequelize.query(`
      SELECT 
        u.nombreUsuario, 
        u.idPersona as user_persona, 
        ep.legajo, 
        ep.idPersona as picker_persona 
      FROM usuario u 
      LEFT JOIN encargadopicker ep ON u.idPersona = ep.idPersona 
      WHERE u.nombreUsuario = 'luisrd'
    `);
    
    console.log('Resultado:', result);
    
    // También verificar todos los pickers
    const [allPickers] = await sequelize.query(`
      SELECT legajo, idPersona FROM encargadopicker
    `);
    
    console.log('Todos los pickers:', allPickers);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPickerMapping();
