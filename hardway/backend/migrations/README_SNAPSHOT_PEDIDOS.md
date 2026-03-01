# 🔄 Migración: Snapshot de Datos en Detalle de Pedidos

## 📋 Problema Identificado

Cuando se editaba una indumentaria (precio, nombre, color, etc.) después de crear un pedido, los cambios se reflejaban retroactivamente en los pedidos históricos. Esto ocurría porque la tabla `detallepedido` solo almacenaba referencias (`codigoIndumentaria`) y los datos descriptivos se obtenían mediante JOINs con las tablas actuales.

## ✅ Solución Implementada

Se implementó un **sistema de snapshot** que preserva los datos del producto al momento exacto de crear el pedido. Esto garantiza que los pedidos históricos permanezcan inalterados cuando se modifica la indumentaria.

## 🔧 Cambios Realizados

### 1. Estructura de Base de Datos

**Nuevas columnas agregadas a `detallepedido`:**
- `nombreProducto` VARCHAR(100) - Nombre del producto al momento del pedido
- `colorProducto` VARCHAR(50) - Color del producto al momento del pedido
- `talleProducto` VARCHAR(20) - Talle del producto al momento del pedido
- `categoriaProducto` VARCHAR(50) - Categoría del producto al momento del pedido
- `telaProducto` VARCHAR(50) - Tela del producto al momento del pedido
- `precioUnitario` DECIMAL(10,2) - Precio unitario al momento del pedido
- `nombrePresentacion` VARCHAR(50) - Nombre de la presentación al momento del pedido

### 2. Archivos Modificados

#### Backend:
- ✅ `backend/models/DetallePedido.js` - Modelo actualizado con nuevas columnas
- ✅ `backend/routes/pedidos.js` - Captura y guarda snapshot al crear pedidos
- ✅ `backend/routes/pedidos.js` - Consulta de detalle usa snapshot con fallback
- ✅ `backend/migrations/10-agregar-snapshot-datos-detallepedido.sql` - DDL
- ✅ `backend/migrations/11-migrar-datos-existentes-detallepedido.sql` - DML
- ✅ `backend/ejecutar-migracion-snapshot.js` - Script de ejecución automática

## 🚀 Instrucciones de Instalación

### Opción 1: Ejecutar con Node.js (RECOMENDADO)

```bash
cd backend
node ejecutar-migracion-snapshot.js
```

Este script:
1. Agrega las columnas nuevas a `detallepedido`
2. Migra los datos existentes con valores actuales
3. Muestra estadísticas y ejemplos
4. Valida que todo funcionó correctamente

### Opción 2: Ejecutar SQL manualmente

Si prefieres ejecutar los scripts SQL directamente en tu cliente de base de datos:

```sql
-- 1. Primero ejecutar:
SOURCE backend/migrations/10-agregar-snapshot-datos-detallepedido.sql;

-- 2. Luego ejecutar:
SOURCE backend/migrations/11-migrar-datos-existentes-detallepedido.sql;
```

## 📊 Funcionamiento

### Antes (Problema):
```
Pedido creado -> Guarda solo codigoIndumentaria
                             ↓
Al consultar pedido -> JOIN con tablas actuales (❌ datos pueden cambiar)
```

### Después (Solución):
```
Pedido creado -> Guarda codigoIndumentaria + SNAPSHOT completo de datos
                             ↓
Al consultar pedido -> Usa SNAPSHOT (✅ datos preservados)
                       └─→ Fallback a JOIN solo si snapshot no existe (pedidos antiguos)
```

## 🔍 Validación

### Verificar que las columnas existen:
```sql
DESCRIBE detallepedido;
```

### Verificar datos migrados:
```sql
SELECT 
  idDetallePedido,
  codigoIndumentaria,
  nombreProducto,
  precioUnitario,
  colorProducto,
  talleProducto
FROM detallepedido
LIMIT 10;
```

### Estadísticas:
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN nombreProducto IS NOT NULL THEN 1 ELSE 0 END) as con_snapshot,
  SUM(CASE WHEN nombreProducto IS NULL THEN 1 ELSE 0 END) as sin_snapshot
FROM detallepedido;
```

## ⚠️ Notas Importantes

1. **Datos Históricos**: Los pedidos existentes se migran con los valores ACTUALES de las tablas de indumentaria, no con los valores que tenían al momento de crear el pedido (esos datos no estaban guardados). A partir de ahora, todos los pedidos nuevos guardarán los datos correctos.

2. **Compatibilidad**: La consulta usa `COALESCE(dp.nombreProducto, ni.nombre)` para garantizar compatibilidad con pedidos antiguos que no tienen snapshot.

3. **Referencias FK**: Se mantiene `codigoIndumentaria` como foreign key para trazabilidad, pero los datos descriptivos no dependen de ella.

4. **Performance**: Los índices existentes en `detallepedido.numeroPedido` mejoran el rendimiento de las consultas.

## 🧪 Prueba de Funcionamiento

### Test 1: Crear un nuevo pedido
1. Crear un pedido nuevo
2. Verificar que las columnas de snapshot se llenaron:
```sql
SELECT * FROM detallepedido WHERE numeroPedido = 'PED-YYYYMMDD-XXX';
```

### Test 2: Modificar indumentaria
1. Cambiar el precio de una indumentaria
2. Consultar un pedido anterior que contenía esa indumentaria
3. Verificar que el precio mostrado es el del snapshot, no el nuevo precio

### Test 3: Verificar detalle en frontend
1. Ir a "Detalle de Pedido" en la aplicación
2. Verificar que muestra nombre, precio, color, talle correctos
3. Modificar la indumentaria desde "Gestión de Indumentaria"
4. Volver al detalle del pedido y verificar que NO cambió

## 🎯 Beneficios

✅ **Integridad de datos**: Los pedidos históricos permanecen inalterados  
✅ **Auditoría**: Preserva exactamente lo que el cliente vio y compró  
✅ **Performance**: Menos JOINs en consultas (datos ya están en la tabla)  
✅ **Simplicidad**: Solución directa sin complejidad adicional  
✅ **Escalabilidad**: Funciona incluso si se eliminan productos del catálogo  

## 📞 Soporte

Si encuentras algún problema durante la migración:
1. Revisa los logs de error
2. Verifica que las migraciones anteriores se ejecutaron correctamente
3. Asegúrate de tener permisos ALTER TABLE en la base de datos
4. Contacta al equipo de desarrollo con el mensaje de error completo

---

**Fecha de implementación**: 1 de marzo de 2026  
**Versión**: 1.0  
**Autor**: Sistema de Gestión Hardway
