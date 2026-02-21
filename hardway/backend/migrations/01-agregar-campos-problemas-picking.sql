-- Migración: Agregar campos para registro de problemas en picking
-- Fecha: 2026-02-19
-- Propósito: Permitir al picker reportar productos faltantes o dañados durante el picking

-- 1. Agregar campos para registro de problemas
ALTER TABLE `asignacion_picking`
  ADD COLUMN `tieneProblemas` TINYINT(1) DEFAULT 0 COMMENT '1 = Se reportaron problemas durante el picking' AFTER `observaciones`,
  ADD COLUMN `idMotivoProblema` INT(11) NULL COMMENT 'FK a motivo_no_apta - Motivo del problema reportado' AFTER `tieneProblemas`,
  ADD COLUMN `observacionesProblema` TEXT NULL COMMENT 'Detalle adicional del problema reportado por el picker' AFTER `idMotivoProblema`,
  ADD COLUMN `completarParcial` TINYINT(1) DEFAULT 0 COMMENT '1 = Picker decidió completar parcialmente el pedido con el problema' AFTER `observacionesProblema`;

-- 2. Agregar índice y clave foránea
ALTER TABLE `asignacion_picking`
  ADD KEY `fk_asignacion_motivo_problema` (`idMotivoProblema`);

ALTER TABLE `asignacion_picking`
  ADD CONSTRAINT `fk_asignacion_motivo_problema` 
  FOREIGN KEY (`idMotivoProblema`) 
  REFERENCES `motivo_no_apta` (`idMotivo`)
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Verificación: Consultar estructura actualizada
-- SELECT * FROM information_schema.COLUMNS 
-- WHERE TABLE_NAME = 'asignacion_picking' 
-- AND TABLE_SCHEMA = 'hardway1';
