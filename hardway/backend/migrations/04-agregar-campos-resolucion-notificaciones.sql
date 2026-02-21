-- Migración: Agregar campos de resolución a notificacion_pedido
-- Fecha: 2026-02-20
-- Descripción: Permite al vendedor resolver notificaciones de problemas del picking
--              con diferentes tipos de resolución y comunicar la decisión al picker

USE hardway1;

-- Agregar campos de resolución a notificacion_pedido
ALTER TABLE notificacion_pedido
  ADD COLUMN estadoResolucion ENUM('pendiente', 'resuelto', 'rechazado') 
    NOT NULL DEFAULT 'pendiente'
    COMMENT 'Estado de la resolución de la notificación',
  
  ADD COLUMN tipoResolucion ENUM(
    'cancelar_articulo',
    'reducir_cantidad', 
    'producto_alternativo',
    'reabastecer',
    'continuar',
    'cancelar_pedido'
  ) NULL 
    COMMENT 'Tipo de resolución aplicada por el vendedor',
  
  ADD COLUMN idUsuarioResolvio INT NULL 
    COMMENT 'Usuario (vendedor) que resolvió la notificación',
  
  ADD COLUMN fechaResolucion DATETIME NULL 
    COMMENT 'Fecha y hora en que se resolvió',
  
  ADD COLUMN observacionesResolucion TEXT 
    CHARACTER SET utf8 COLLATE utf8_spanish_ci NULL 
    COMMENT 'Observaciones/instrucciones del vendedor sobre la resolución',
  
  ADD COLUMN codigoIndumentariaAlternativo VARCHAR(50) NULL 
    COMMENT 'Si se usó producto alternativo, código del reemplazo',
  
  ADD COLUMN nuevaCantidad INT NULL 
    COMMENT 'Si se redujo cantidad, nueva cantidad autorizada';

-- Agregar tipo de notificación para resoluciones que van al picker
ALTER TABLE notificacion_pedido
  MODIFY COLUMN tipoNotificacion ENUM(
    'problema_picking', 
    'cambio_estado', 
    'cancelacion', 
    'resolucion_vendedor',
    'otro'
  ) DEFAULT 'problema_picking' NOT NULL;

-- Actualizar notificaciones existentes que tengan NULL en estadoResolucion
UPDATE notificacion_pedido 
SET estadoResolucion = 'pendiente' 
WHERE estadoResolucion IS NULL;

-- Verificar estructura
DESCRIBE notificacion_pedido;
