// Script para simular login en localStorage (para debugging)
// Ejecutar en la consola del navegador:

localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('username', 'admin');
localStorage.setItem('rol', 'Administrador');

console.log('localStorage configurado:');
console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));
console.log('username:', localStorage.getItem('username'));
console.log('rol:', localStorage.getItem('rol'));

console.log('Ahora recarga la página para ver los cambios...');
