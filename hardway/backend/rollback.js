#!/usr/bin/env node

/**
 * Script de rollback del backend
 * Este script permite volver al sistema original si es necesario
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando rollback del backend...\n');

const restoreOriginal = () => {
  console.log('📦 Restaurando archivo original...');
  
  const backupPath = path.join(__dirname, 'index.backup.js');
  const mainPath = path.join(__dirname, 'index.js');
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, mainPath);
    console.log('✅ Archivo original restaurado');
  } else {
    console.log('❌ Backup no encontrado (index.backup.js)');
    console.log('⚠️  No se puede realizar el rollback');
    process.exit(1);
  }
};

const main = () => {
  console.log('🔙 ROLLBACK DEL BACKEND - HARDWAY SYSTEM');
  console.log('=========================================\n');
  
  try {
    restoreOriginal();
    console.log('');
    
    console.log('🎉 ¡ROLLBACK COMPLETADO EXITOSAMENTE!');
    console.log('');
    console.log('📋 Estado actual:');
    console.log('   • Sistema original restaurado');
    console.log('   • Archivo refactorizado conservado como index_new.js');
    console.log('   • Estructura modular disponible para uso futuro');
    console.log('');
    console.log('🔧 Para iniciar el sistema original:');
    console.log('   npm start');
    console.log('   o');
    console.log('   node index.js');
    
  } catch (error) {
    console.error('❌ Error durante el rollback:', error.message);
    process.exit(1);
  }
};

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, restoreOriginal };
