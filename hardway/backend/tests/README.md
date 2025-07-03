# Scripts de Verificación del Sistema

Este documento explica los scripts disponibles para verificar el funcionamiento correcto del sistema de gestión de pedidos, picking, envíos y clientes.

## Descripción General

Los scripts de verificación están diseñados para probar diferentes aspectos del sistema:

1. **Verificación básica**: Comprueba la disponibilidad de endpoints, autenticación y acceso a datos básicos.
2. **Verificación CRUD**: Prueba las operaciones completas de crear, leer, actualizar y eliminar registros.
3. **Pruebas de integración**: Verifica que los diferentes módulos del sistema funcionen de manera integrada.

## Scripts Disponibles

### Scripts Principales

- `verificar-sistema.js` - Verifica endpoints básicos, autenticación y acceso a datos.
- `tests/test-crud-completo.js` - Prueba operaciones CRUD completas en clientes, pedidos e indumentaria.
- `tests/verificar-sistema-completo.js` - Ejecuta todos los tests y muestra un informe unificado.

### Scripts Específicos

- `tests/test-login.js` - Prueba la autenticación de usuarios.
- `tests/test-pickers.js` - Verifica la gestión de pickers.
- `tests/test-picking-simplificado.js` - Prueba el flujo de picking.
- `tests/test-clientes.js` - Verifica la gestión de clientes.
- `tests/test-pedidos.js` - Prueba la gestión de pedidos.
- `tests/test-envios-auth.js` - Verifica la gestión de envíos.
- `tests/test-cp-cliente.js` - Prueba los códigos postales en clientes.
- `tests/test-ciudades-barrios.js` - Verifica la gestión de ciudades y barrios.
- `tests/test-edicion-cliente.js` - Prueba la edición de clientes.

## Cómo Usar

### Verificación Completa del Sistema

Para ejecutar todas las pruebas y obtener un informe unificado:

```bash
cd backend
node tests/verificar-sistema-completo.js
```

### Verificación Básica

Para verificar solo los endpoints principales y la autenticación:

```bash
cd backend
node verificar-sistema.js
```

### Pruebas CRUD

Para probar operaciones CRUD completas:

```bash
cd backend
node tests/test-crud-completo.js
```

## Configuración

La configuración centralizada para todos los scripts está en `tests/config.js`. Puedes modificar:

- URL de la API
- Credenciales de prueba
- Datos de prueba para entidades (clientes, indumentaria, etc.)

## Notas Importantes

1. **Antes de ejecutar**: Asegúrate de que el backend esté corriendo en http://localhost:3001
2. **Limpieza de datos**: Los scripts de CRUD intentan limpiar los datos de prueba al finalizar, pero verifica manualmente si es necesario
3. **Seguridad**: Estos scripts usan credenciales de prueba que deberían ser distintas en entornos de producción

## Funcionalidades Verificadas

- ✅ Autenticación (admin y picker)
- ✅ Gestión de Clientes (CRUD)
- ✅ Gestión de Pedidos (CRUD)
- ✅ Picking (asignación, visualización)
- ✅ Envíos (gestión, seguimiento)
- ✅ Gestión de Indumentaria (CRUD)
- ✅ Reportes (consulta, generación)
- ✅ Componentes auxiliares (ciudades, CP, motivos de cancelación)
