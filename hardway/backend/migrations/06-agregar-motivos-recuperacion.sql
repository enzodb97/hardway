-- =====================================================
-- Migración 06: Agregar sistema de motivos de recuperación
-- Fecha: 2026-03-01
-- Descripción: 
--   - Agrega campo motivoSolicitud a solicitudes_recuperacion_password
--   - Crea tabla catálogo de motivos predefinidos
--   - Inserta motivos iniciales seleccionados
-- =====================================================

USE hardway1;

-- =====================================================
-- 1. AGREGAR CAMPO MOTIVO A SOLICITUDES
-- =====================================================

-- Agregar campo para guardar el motivo de la solicitud (texto libre o de catálogo)
ALTER TABLE `solicitudes_recuperacion_password`
ADD COLUMN `motivoSolicitud` VARCHAR(500) NULL 
COMMENT 'Motivo por el cual el usuario solicita la recuperación de contraseña'
AFTER `idUsuario`;

-- Agregar campo para FK al catálogo de motivos (opcional)
ALTER TABLE `solicitudes_recuperacion_password`
ADD COLUMN `idMotivo` INT(11) NULL
COMMENT 'Referencia al motivo predefinido del catálogo'
AFTER `idUsuario`;

-- =====================================================
-- 2. CREAR TABLA DE CATÁLOGO DE MOTIVOS
-- =====================================================

CREATE TABLE IF NOT EXISTS `motivos_recuperacion_password` (
  `idMotivo` INT(11) NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(255) NOT NULL COMMENT 'Descripción del motivo',
  `activo` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Activo, 0=Inactivo',
  `orden` INT(11) NOT NULL DEFAULT 0 COMMENT 'Orden de visualización en el frontend',
  PRIMARY KEY (`idMotivo`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de motivos predefinidos para solicitud de recuperación de contraseña';

-- =====================================================
-- 3. INSERTAR MOTIVOS PREDEFINIDOS
-- =====================================================

INSERT INTO `motivos_recuperacion_password` 
  (`descripcion`, `activo`, `orden`) 
VALUES
  ('Olvidé mi contraseña', 1, 1),
  ('Creo que mi cuenta fue comprometida', 1, 2),
  ('Quiero cambiar por seguridad', 1, 3);

-- =====================================================
-- 4. AGREGAR FOREIGN KEY (OPCIONAL - PERMITE NULL)
-- =====================================================

ALTER TABLE `solicitudes_recuperacion_password`
ADD CONSTRAINT `fk_solicitud_motivo`
FOREIGN KEY (`idMotivo`)
REFERENCES `motivos_recuperacion_password` (`idMotivo`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- =====================================================
-- 5. AGREGAR ÍNDICE PARA BÚSQUEDAS POR MOTIVO
-- =====================================================

ALTER TABLE `solicitudes_recuperacion_password`
ADD KEY `idx_id_motivo` (`idMotivo`);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar estructura de tabla de motivos
SELECT 'Tabla motivos_recuperacion_password creada:' AS Verificacion;
DESCRIBE `motivos_recuperacion_password`;

-- Verificar motivos insertados
SELECT 'Motivos insertados:' AS Verificacion;
SELECT * FROM `motivos_recuperacion_password`;

-- Verificar columnas agregadas
SELECT 'Columnas agregadas a solicitudes_recuperacion_password:' AS Verificacion;
SHOW COLUMNS FROM `solicitudes_recuperacion_password` LIKE 'motivo%';
SHOW COLUMNS FROM `solicitudes_recuperacion_password` LIKE 'idMotivo';

-- Fin de migración 06
