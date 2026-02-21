-- ================================================================================
-- MIGRACIÓN COMPLETA: SISTEMA DE PICKING Y RESOLUCIÓN DE PROBLEMAS
-- ================================================================================
-- Fecha: 2026-02-20
-- Descripción: Implementa el sistema completo de control de calidad en picking:
--              1. Reportar problemas de artículos específicos
--              2. Notificaciones bidireccionales (picker ↔ vendedor)
--              3. 6 tipos de resolución por el vendedor
--              4. Comunicación de decisiones al picker
-- ================================================================================

USE hardway1;

-- ================================================================================
-- PASO 1: CAMPOS BÁSICOS DE PROBLEMAS EN PICKING
-- ================================================================================
-- Permite al picker reportar problemas durante el picking

ALTER TABLE `asignacion_picking`
  ADD COLUMN `tieneProblemas` TINYINT(1) DEFAULT 0 
    COMMENT '1 = Se reportaron problemas durante el picking' 
    AFTER `observaciones`,
  
  ADD COLUMN `idMotivoProblema` INT(11) NULL 
    COMMENT 'FK a motivo_no_apta - Motivo del problema reportado' 
    AFTER `tieneProblemas`,
  
  ADD COLUMN `observacionesProblema` TEXT NULL 
    COMMENT 'Detalle adicional del problema reportado por el picker' 
    AFTER `idMotivoProblema`,
  
  ADD COLUMN `completarParcial` TINYINT(1) DEFAULT 0 
    COMMENT '1 = Picker decidió completar parcialmente el pedido con el problema' 
    AFTER `observacionesProblema`;

-- Agregar índice y clave foránea
ALTER TABLE `asignacion_picking`
  ADD KEY `fk_asignacion_motivo_problema` (`idMotivoProblema`);

ALTER TABLE `asignacion_picking`
  ADD CONSTRAINT `fk_asignacion_motivo_problema` 
  FOREIGN KEY (`idMotivoProblema`) 
  REFERENCES `motivo_no_apta` (`idMotivo`)
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

SELECT '✅ PASO 1 COMPLETADO: Campos de problemas agregados a asignacion_picking' AS Estado;


-- ================================================================================
-- PASO 2: DETALLE DE ARTÍCULO ESPECÍFICO CON PROBLEMA
-- ================================================================================
-- Permite identificar qué artículo exacto del pedido tiene problema

ALTER TABLE `asignacion_picking`
  ADD COLUMN `idDetallePedidoProblema` VARCHAR(255) NULL 
    COMMENT 'ID del detalle de pedido con problema' 
    AFTER `completarParcial`,
  
  ADD COLUMN `cantidadConProblema` INT(11) NULL 
    COMMENT 'Cantidad de unidades del artículo con problema' 
    AFTER `idDetallePedidoProblema`;

-- Agregar foreign key para idDetallePedidoProblema
ALTER TABLE `asignacion_picking`
  ADD CONSTRAINT `fk_asignacion_detalle_problema` 
    FOREIGN KEY (`idDetallePedidoProblema`) 
    REFERENCES `detallepedido` (`idDetallePedido`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Agregar índice para mejorar búsquedas
ALTER TABLE `asignacion_picking`
  ADD INDEX `idx_detalle_problema` (`idDetallePedidoProblema`);

SELECT '✅ PASO 2 COMPLETADO: Campos de detalle de artículo agregados' AS Estado;


-- ================================================================================
-- PASO 3: CREAR TABLA DE NOTIFICACIONES
-- ================================================================================
-- Sistema de notificaciones bidireccionales entre picker y vendedor

CREATE TABLE IF NOT EXISTS `notificacion_pedido` (
  `idNotificacion` INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `numeroPedido` VARCHAR(50) NOT NULL 
    COMMENT 'Pedido relacionado con la notificación',
  
  `idUsuarioDestino` INT(11) NOT NULL 
    COMMENT 'Usuario que debe recibir la notificación (vendedor o picker)',
  
  `tipoNotificacion` ENUM('problema_picking', 'cambio_estado', 'cancelacion', 'otro') 
    NOT NULL DEFAULT 'problema_picking',
  
  `mensaje` TEXT NOT NULL 
    COMMENT 'Contenido de la notificación',
  
  `fechaNotificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  `leida` TINYINT(1) NOT NULL DEFAULT 0 
    COMMENT '0 = No leída, 1 = Leída',
  
  `fechaLectura` DATETIME NULL 
    COMMENT 'Fecha en que se marcó como leída',
  
  `idAsignacionPicking` INT(11) NULL 
    COMMENT 'Referencia opcional a la asignación de picking',
  
  INDEX `idx_usuario_destino` (`idUsuarioDestino`),
  INDEX `idx_pedido` (`numeroPedido`),
  INDEX `idx_leida` (`leida`),
  INDEX `idx_fecha` (`fechaNotificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- Agregar foreign keys
ALTER TABLE `notificacion_pedido`
  ADD CONSTRAINT `fk_notif_pedido_usuario` 
    FOREIGN KEY (`idUsuarioDestino`) 
    REFERENCES `usuario` (`idUsuario`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE `notificacion_pedido`
  ADD CONSTRAINT `fk_notif_pedido` 
    FOREIGN KEY (`numeroPedido`) 
    REFERENCES `pedido` (`numeroPedido`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE `notificacion_pedido`
  ADD CONSTRAINT `fk_notif_asignacion` 
    FOREIGN KEY (`idAsignacionPicking`) 
    REFERENCES `asignacion_picking` (`idAsignacion`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

SELECT '✅ PASO 3 COMPLETADO: Tabla notificacion_pedido creada con FKs' AS Estado;


-- ================================================================================
-- PASO 4: CAMPOS DE RESOLUCIÓN DE PROBLEMAS
-- ================================================================================
-- Permite al vendedor resolver problemas con 6 tipos de resolución

ALTER TABLE `notificacion_pedido`
  ADD COLUMN `estadoResolucion` ENUM('pendiente', 'resuelto', 'rechazado') 
    NOT NULL DEFAULT 'pendiente'
    COMMENT 'Estado de la resolución de la notificación',
  
  ADD COLUMN `tipoResolucion` ENUM(
    'cancelar_articulo',
    'reducir_cantidad', 
    'producto_alternativo',
    'reabastecer',
    'continuar',
    'cancelar_pedido'
  ) NULL 
    COMMENT 'Tipo de resolución aplicada por el vendedor',
  
  ADD COLUMN `idUsuarioResolvio` INT NULL 
    COMMENT 'Usuario (vendedor) que resolvió la notificación',
  
  ADD COLUMN `fechaResolucion` DATETIME NULL 
    COMMENT 'Fecha y hora en que se resolvió',
  
  ADD COLUMN `observacionesResolucion` TEXT 
    CHARACTER SET utf8 COLLATE utf8_spanish_ci NULL 
    COMMENT 'Observaciones/instrucciones del vendedor sobre la resolución',
  
  ADD COLUMN `codigoIndumentariaAlternativo` VARCHAR(50) NULL 
    COMMENT 'Si se usó producto alternativo, código del reemplazo',
  
  ADD COLUMN `nuevaCantidad` INT NULL 
    COMMENT 'Si se redujo cantidad, nueva cantidad autorizada';

-- Actualizar ENUM de tipoNotificacion para incluir resoluciones al picker
ALTER TABLE `notificacion_pedido`
  MODIFY COLUMN `tipoNotificacion` ENUM(
    'problema_picking', 
    'cambio_estado', 
    'cancelacion', 
    'resolucion_vendedor',
    'otro'
  ) DEFAULT 'problema_picking' NOT NULL;

-- Actualizar notificaciones existentes (si las hay)
UPDATE `notificacion_pedido` 
SET `estadoResolucion` = 'pendiente' 
WHERE `estadoResolucion` IS NULL;

SELECT '✅ PASO 4 COMPLETADO: Campos de resolución agregados' AS Estado;


-- ================================================================================
-- VERIFICACIÓN FINAL
-- ================================================================================

SELECT '
================================================================================
🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE
================================================================================

RESUMEN DE CAMBIOS:
-------------------
1. ✅ Tabla asignacion_picking:
   - 6 campos nuevos para registro de problemas
   - 2 índices y 2 foreign keys

2. ✅ Tabla notificacion_pedido:
   - Tabla creada con 9 campos base
   - 7 campos de resolución agregados
   - 4 índices y 3 foreign keys
   - ENUM tipoNotificacion actualizado (5 valores)

FUNCIONALIDADES HABILITADAS:
----------------------------
📋 Picker puede reportar problemas específicos
📲 Notificaciones bidireccionales picker ↔ vendedor
⚙️ 6 tipos de resolución disponibles para el vendedor
🚫 Modal "No Apta" usa tablas existentes (sin cambios en BD)

PRESENTACIONES SOPORTADAS:
-------------------------
📦 Unidades individuales
📦 Packs (con conversión automática)
📦 Cajas Cerradas (con conversión automática)

================================================================================
' AS 'RESULTADO';

-- Mostrar estructura final de las tablas modificadas
SELECT '--- ESTRUCTURA FINAL: asignacion_picking ---' AS '';
DESCRIBE `asignacion_picking`;

SELECT '--- ESTRUCTURA FINAL: notificacion_pedido ---' AS '';
DESCRIBE `notificacion_pedido`;
