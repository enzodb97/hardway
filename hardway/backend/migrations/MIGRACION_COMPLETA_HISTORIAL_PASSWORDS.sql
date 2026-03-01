-- =====================================================
-- MIGRACIÓN COMPLETA: Sistema de Historial de Cambios de Contraseña
-- Fecha: 2026-03-01
-- Descripción: 
--   Creación completa del sistema de recuperación de contraseña con trazabilidad
--   Incluye tabla principal, catálogo de motivos, y todos los índices necesarios
-- Compatible con: XAMPP/phpMyAdmin/MariaDB
-- =====================================================

USE hardway1;

-- =====================================================
-- PARTE 1: CREAR TABLA DE CATÁLOGO DE MOTIVOS
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

-- Insertar motivos predefinidos
INSERT INTO `motivos_recuperacion_password` 
  (`descripcion`, `activo`, `orden`) 
VALUES
  ('Olvidé mi contraseña', 1, 1),
  ('Creo que mi cuenta fue comprometida', 1, 2),
  ('Quiero cambiar por seguridad', 1, 3);

-- =====================================================
-- PARTE 2: CREAR TABLA DE SOLICITUDES DE RECUPERACIÓN
-- =====================================================

CREATE TABLE IF NOT EXISTS `solicitudes_recuperacion_password` (
  `idSolicitud` INT(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` INT(11) NOT NULL,
  `idMotivo` INT(11) NULL COMMENT 'Referencia al motivo predefinido del catálogo',
  `motivoSolicitud` VARCHAR(500) NULL COMMENT 'Motivo por el cual el usuario solicita la recuperación de contraseña',
  `codigo` VARCHAR(4) NOT NULL DEFAULT '0000',
  `estado` ENUM('PENDIENTE','APROBADA','FINALIZADA','RECHAZADA','EXPIRADA') NOT NULL DEFAULT 'PENDIENTE',
  `fechaSolicitud` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaExpiracion` DATETIME NOT NULL,
  `fechaAprobacion` DATETIME DEFAULT NULL,
  `fechaFinalizacion` DATETIME DEFAULT NULL COMMENT 'Fecha y hora cuando el usuario finalizó el restablecimiento',
  `idAdminAprobador` INT(11) DEFAULT NULL,
  `motivoRechazo` TEXT DEFAULT NULL,
  `ipOrigen` VARCHAR(45) DEFAULT NULL,
  `intentosErroneos` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idSolicitud`),
  KEY `idx_usuario` (`idUsuario`),
  KEY `idx_id_motivo` (`idMotivo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_expiracion` (`fechaExpiracion`),
  KEY `idx_usuario_estado` (`idUsuario`,`estado`),
  KEY `idx_codigo_estado` (`codigo`,`estado`),
  KEY `fk_solicitud_admin` (`idAdminAprobador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci
COMMENT='Solicitudes de recuperación de contraseña con sistema de trazabilidad';

-- =====================================================
-- PARTE 3: AGREGAR FOREIGN KEYS
-- =====================================================

ALTER TABLE `solicitudes_recuperacion_password`
  ADD CONSTRAINT `fk_solicitud_usuario` 
    FOREIGN KEY (`idUsuario`) 
    REFERENCES `usuario` (`idUsuario`) 
    ON DELETE CASCADE,
  ADD CONSTRAINT `fk_solicitud_admin` 
    FOREIGN KEY (`idAdminAprobador`) 
    REFERENCES `usuario` (`idUsuario`) 
    ON DELETE SET NULL,
  ADD CONSTRAINT `fk_solicitud_motivo`
    FOREIGN KEY (`idMotivo`)
    REFERENCES `motivos_recuperacion_password` (`idMotivo`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- =====================================================
-- PARTE 4: MIGRACIÓN DE DATOS EXISTENTES (SI LA TABLA YA EXISTE)
-- =====================================================

-- Si la tabla ya existía con el estado 'USADA', actualizarla a 'FINALIZADA'
-- Esta sección solo afecta si ya hay datos previos
UPDATE `solicitudes_recuperacion_password`
SET `estado` = 'FINALIZADA'
WHERE `estado` = 'USADA';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar tabla de motivos
SELECT '✅ Tabla motivos_recuperacion_password creada' AS Resultado;
SELECT * FROM `motivos_recuperacion_password`;

-- Verificar estructura de tabla de solicitudes
SELECT '✅ Tabla solicitudes_recuperacion_password creada' AS Resultado;
DESCRIBE `solicitudes_recuperacion_password`;

-- Verificar índices
SELECT '✅ Índices creados' AS Resultado;
SHOW INDEX FROM `solicitudes_recuperacion_password`;

-- Verificar foreign keys
SELECT '✅ Foreign Keys configuradas' AS Resultado;
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM 
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
  TABLE_SCHEMA = 'hardway1'
  AND TABLE_NAME = 'solicitudes_recuperacion_password'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verificar que no existan registros con estado USADA
SELECT 
  '✅ Verificación de estados' AS Resultado,
  estado,
  COUNT(*) AS cantidad
FROM `solicitudes_recuperacion_password`
GROUP BY estado;

-- =====================================================
-- FIN DE MIGRACIÓN COMPLETA
-- =====================================================

SELECT '🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE' AS Resultado;
SELECT 'Sistema de Historial de Cambios de Contraseña instalado' AS Descripcion;
