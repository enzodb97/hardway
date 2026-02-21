# Sistema de Reporte de Problemas en Picking

## Descripción
Sistema que permite a los pickers reportar productos faltantes o dañados durante el proceso de picking, especificando el artículo exacto y la cantidad afectada, con notificación automática al vendedor que creó el pedido.

## Características Implementadas

### Backend
- ✅ Migración SQL para agregar campos de problemas a `asignacion_picking`
- ✅ Campos adicionales `idDetallePedidoProblema` y `cantidadConProblema` para identificar artículo específico
- ✅ Tabla `notificacion_pedido` para notificaciones automáticas
- ✅ Modelo `NotificacionPedido` con relaciones
- ✅ Endpoint `GET /api/picking/motivos-problemas` (reutiliza `motivo_no_apta`)
- ✅ Endpoint modificado `POST /api/picking/tareas/:numeroPedido/completar` con soporte para problemas y artículos específicos
- ✅ Endpoint `GET /api/pedidos/notificaciones/:idUsuario` para consultar notificaciones
- ✅ Endpoint `PUT /api/pedidos/notificaciones/:idNotificacion/marcar-leida`

### Frontend
- ✅ Modal de reporte de problemas en Picking.tsx
- ✅ Selector de artículo específico del pedido con problema
- ✅ Input de cantidad con validación (máximo: cantidad del artículo)
- ✅ Selector de motivos (9 motivos predefinidos)
- ✅ Opción "Esperar resolución" vs "Completar parcialmente"
- ✅ Funciones en `pickingUtils.ts` para manejo de problemas y notificaciones
- ✅ Estilos CSS profesionales para el modal

## Instalación

### 1. Ejecutar Migraciones SQL

Las migraciones se encuentran en `backend/migrations/`:

#### Opción A: Usando phpMyAdmin
1. Abrir phpMyAdmin
2. Seleccionar base de datos `hardway1`
3. Ir a pestaña "SQL"
4. Ejecutar en orden:
   - `agregar-campos-problemas-picking.sql`
   - `crear-tabla-notificaciones-pedido.sql`
   - `agregar-detalle-articulo-problema.sql` (nuevo)

#### Opción B: Usando línea de comandos
```bash
cd backend/migrations

# Ejecutar migraciones
mysql -u root -p hardway1 < agregar-campos-problemas-picking.sql
mysql -u root -p hardway1 < crear-tabla-notificaciones-pedido.sql
mysql -u root -p hardway1 < agregar-detalle-articulo-problema.sql
```

### 2. Reiniciar el Backend
```bash
cd backend
node index.js
```

### 3. Reiniciar el Frontend
```bash
cd ..
npm run dev
```

## Uso del Sistema

### Para Pickers

1. **Completar tarea sin problemas**:
   - Hacer clic en botón "Completar"
   - Seleccionar "Completar sin problemas"
   - El pedido pasa a estado "Pendiente de Pago"

2. **Reportar problema**:
   - Hacer clic en botón "Completar"
   - Seleccionar "Reportar Problema"
   - **Seleccionar artículo con problema** (obligatorio): Lista desplegable con todos los artículos del pedido
   - **Ingresar cantidad con problema** (obligatorio): Máximo la cantidad del artículo seleccionado
   - Seleccionar motivo del problema (obligatorio)
   - Agregar observaciones adicionales (opcional)
   - Elegir una de las opciones:
     * **Esperar resolución**: Pedido queda en "En Curso" hasta que admin resuelva
     * **Completar parcialmente**: Pedido pasa a "Pendiente de Pago" con nota de problema

3. **Motivos disponibles**:
   - Defecto de costura
   - Mancha irreparable
   - Problema de teñido / coloración
   - Daño en el empaque / transporte
   - Talla o etiqueta incorrecta
   - Descosido o costura fallida
   - Mancha permanente
   - Daño en la tela (roto o quemado)
   - Fallo de color o estampado

### Para Vendedores

Las notificaciones se mostrarán automáticamente cuando el picker reporte un problema en un pedido creado por ese vendedor.

**Ejemplo de notificación**:
> ⚠️ Problema reportado en pedido P001: Defecto de costura | Artículo: Remera básica (3 unidades). El producto tiene costuras flojas. (Pedido completado parcialmente)

### Para Administradores

Los pedidos con problemas pendientes aparecerán en el dashboard de picking con un indicador visual.

## Estructura de Base de Datos

### Tabla `asignacion_picking` (campos nuevos)
```sql
tieneProblemas TINYINT(1) DEFAULT 0
idMotivoProblema INT(11) NULL -- FK a motivo_no_apta
observacionesProblema TEXT NULL
completarParcial TINYINT(1) DEFAULT 0
idDetallePedidoProblema VARCHAR(255) NULL -- FK a detallepedido
cantidadConProblema INT(11) NULL
```

### Tabla `notificacion_pedido` (nueva)
```sql
idNotificacion INT(11) PRIMARY KEY AUTO_INCREMENT
numeroPedido VARCHAR(50) NOT NULL
idUsuarioDestino INT(11) NOT NULL
tipoNotificacion ENUM('problema_picking', 'cambio_estado', 'cancelacion', 'otro')
mensaje TEXT NOT NULL
fechaNotificacion DATETIME DEFAULT CURRENT_TIMESTAMP
leida TINYINT(1) DEFAULT 0
fechaLectura DATETIME NULL
idAsignacionPicking INT(11) NULL
```

## API Endpoints

### Obtener motivos de problemas
```
GET /api/picking/motivos-problemas
Response: [{ idMotivo, descripcion }]
```

### Completar tarea con problema
```
POST /api/picking/tareas/:numeroPedido/completar
Body: {
  idAsignacion: number,
  observaciones: string,
  tieneProblemas: boolean,
  idMotivoProblema?: number,
  observacionesProblema?: string,
  completarParcial?: boolean
}
```

### Obtener notificaciones de un usuario
```
GET /api/pedidos/notificaciones/:idUsuario?soloNoLeidas=true
Response: [{
  idNotificacion,
  numeroPedido,
  tipoNotificacion,
  mensaje,
  fechaNotificacion,
  leida,
  motivoDescripcion
}]
```

### Marcar notificación como leída
```
PUT /api/pedidos/notificaciones/:idNotificacion/marcar-leida
```

## Flujo Completo

1. **Picker asignado a pedido** → Estado: En Curso
2. **Picker encuentra problema** → Abre modal de reporte
3. **Picker selecciona motivo y opción** → Sistema registra problema
4. **Sistema crea notificación** → Vendedor es notificado
5. **Si "Esperar resolución"** → Pedido queda en "En Curso"
6. **Si "Completar parcialmente"** → Pedido pasa a "Pendiente de Pago"
7. **Vendedor consulta notificación** → Ve detalles del problema
8. **Administrador resuelve problema** → Actualiza estado según corresponda

## Notas Técnicas

- El sistema reutiliza la tabla `motivo_no_apta` existente para evitar duplicación
- Las notificaciones se crean automáticamente en transacción con la actualización del picking
- El vendedor se identifica por `idUsuarioCreo` del pedido
- Los motivos son los mismos utilizados para registro de fallos de stock (consistencia del sistema)
- El frontend es completamente responsive y funciona en móviles

## Verificación

Para verificar que todo funciona correctamente:

1. Verificar tablas creadas:
```sql
DESCRIBE asignacion_picking;
DESCRIBE notificacion_pedido;
```

2. Verificar motivos disponibles:
```sql
SELECT * FROM motivo_no_apta;
```

3. Probar endpoint de motivos:
```
GET http://localhost:3001/api/picking/motivos-problemas
```

## Soporte

Si encuentras algún problema durante la implementación, verifica:
- Que las migraciones SQL se ejecutaron correctamente
- Que el backend se reinició después de las migraciones
- Los logs de consola del backend para errores de SQL
- Los logs de consola del navegador para errores de frontend
