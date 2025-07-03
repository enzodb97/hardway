#!/usr/bin/env node

/**
 * Script de migración del backend
 * Este script permite migrar del sistema monolítico al sistema refactorizado
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando migración del backend...\n');

const backupOriginal = () => {
  console.log('📦 Creando backup del archivo original...');
  
  const originalPath = path.join(__dirname, 'index.js');
  const backupPath = path.join(__dirname, 'index.backup.js');
  
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    console.log('✅ Backup creado: index.backup.js');
  } else {
    console.log('⚠️  Archivo original no encontrado');
  }
};

const replaceMainFile = () => {
  console.log('🔀 Reemplazando archivo principal...');
  
  const newPath = path.join(__dirname, 'index_new.js');
  const mainPath = path.join(__dirname, 'index.js');
  
  if (fs.existsSync(newPath)) {
    fs.copyFileSync(newPath, mainPath);
    console.log('✅ Archivo principal reemplazado');
  } else {
    console.log('❌ Archivo refactorizado no encontrado');
    process.exit(1);
  }
};

const updatePackageJson = () => {
  console.log('📝 Verificando package.json...');
  
  const packagePath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    console.log('✅ package.json encontrado');
  } else {
    console.log('⚠️  package.json no encontrado');
  }
};

const main = () => {
  console.log('🚀 MIGRACIÓN DEL BACKEND - HARDWAY SYSTEM');
  console.log('==========================================\n');
  
  try {
    backupOriginal();
    console.log('');
    
    replaceMainFile();
    console.log('');
    
    updatePackageJson();
    console.log('');
    
    console.log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('');
    console.log('📋 Resumen de cambios:');
    console.log('   • Archivo original respaldado como index.backup.js');
    console.log('   • Sistema refactorizado activado');
    console.log('   • Estructura modular implementada');
    console.log('');
    console.log('🔧 Para iniciar el sistema refactorizado:');
    console.log('   npm start');
    console.log('   o');
    console.log('   node index.js');
    console.log('');
    console.log('🔙 Para revertir la migración:');
    console.log('   node rollback.js');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
};

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, backupOriginal, replaceMainFile };
