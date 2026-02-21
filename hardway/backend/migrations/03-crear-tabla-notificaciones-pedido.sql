-- Migración: Crear tabla para notificaciones de problemas en pedidos
-- Fecha: 2026-02-19
-- Propósito: Notificar al vendedor cuando el picker reporta problemas en un pedido

-- 1. Crear tabla de notificaciones (sin foreign keys primero)
CREATE TABLE IF NOT EXISTS `notificacion_pedido` (
  `idNotificacion` INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `numeroPedido` VARCHAR(50) NOT NULL COMMENT 'Pedido relacionado con la notificación',
  `idUsuarioDestino` INT(11) NOT NULL COMMENT 'Usuario que debe recibir la notificación (generalmente el vendedor)',
  `tipoNotificacion` ENUM('problema_picking', 'cambio_estado', 'cancelacion', 'otro') NOT NULL DEFAULT 'problema_picking',
  `mensaje` TEXT NOT NULL COMMENT 'Contenido de la notificación',
  `fechaNotificacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `leida` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = No leída, 1 = Leída',
  `fechaLectura` DATETIME NULL COMMENT 'Fecha en que se marcó como leída',
  `idAsignacionPicking` INT(11) NULL COMMENT 'Referencia opcional a la asignación de picking',
  INDEX `idx_usuario_destino` (`idUsuarioDestino`),
  INDEX `idx_pedido` (`numeroPedido`),
  INDEX `idx_leida` (`leida`),
  INDEX `idx_fecha` (`fechaNotificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- 2. Agregar foreign keys después de crear la tabla
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

-- Verificación: Consultar estructura creada
-- SELECT * FROM information_schema.TABLES 
-- WHERE TABLE_NAME = 'notificacion_pedido' 
-- AND TABLE_SCHEMA = 'hardway1';
