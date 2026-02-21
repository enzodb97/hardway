-- Migración: Agregar campos para identificar artículo específico con problema
-- Fecha: 2026-02-19
-- Propósito: Permitir que el picker indique qué artículo específico tiene problema y cuántas unidades

-- 1. Agregar campos a asignacion_picking
ALTER TABLE `asignacion_picking`
  ADD COLUMN `idDetallePedidoProblema` VARCHAR(255) NULL COMMENT 'ID del detalle de pedido con problema' AFTER `observacionesProblema`,
  ADD COLUMN `cantidadConProblema` INT(11) NULL COMMENT 'Cantidad de unidades del artículo con problema' AFTER `idDetallePedidoProblema`;

-- 2. Agregar foreign key para idDetallePedidoProblema
ALTER TABLE `asignacion_picking`
  ADD CONSTRAINT `fk_asignacion_detalle_problema` 
    FOREIGN KEY (`idDetallePedidoProblema`) 
    REFERENCES `detallepedido` (`idDetallePedido`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- 3. Agregar índice para mejorar búsquedas
ALTER TABLE `asignacion_picking`
  ADD INDEX `idx_detalle_problema` (`idDetallePedidoProblema`);

-- Verificación: Consultar estructura modificada
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
-- FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'asignacion_picking' 
-- AND COLUMN_NAME IN ('idDetallePedidoProblema', 'cantidadConProblema')
-- AND TABLE_SCHEMA = 'hardway1';
