/* ============================================
   Migración: Sistema de historial de estados de usuarios
   Fecha: 2026-02-15
   Propósito: Registrar activaciones/inactivaciones de usuarios con trazabilidad
   ============================================ */

/* 1. Eliminar tabla si existe (para evitar errores de constraints duplicados) */
DROP TABLE IF EXISTS usuario_historial_estado;

/* 2. Crear tabla de historial de estados de usuario */
CREATE TABLE usuario_historial_estado (
  idHistorial INT PRIMARY KEY AUTO_INCREMENT,
  idUsuario INT NOT NULL,
  estaActivo TINYINT(1) NOT NULL COMMENT '1 = Activo, 0 = Inactivo',
  fechaCambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idUsuarioModifico INT NULL COMMENT 'Usuario que realizó el cambio',
  idMotivoInactivacion INT NULL COMMENT 'Motivo si fue inactivación',
  observaciones TEXT NULL COMMENT 'Observaciones adicionales',
  INDEX idx_usuario_fecha (idUsuario, fechaCambio DESC),
  INDEX idx_fecha (fechaCambio DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* 3. Agregar foreign keys después de crear la tabla */
ALTER TABLE usuario_historial_estado
ADD CONSTRAINT fk_uh_usuario 
  FOREIGN KEY (idUsuario) 
  REFERENCES usuario(idUsuario)
  ON DELETE CASCADE;

ALTER TABLE usuario_historial_estado
ADD CONSTRAINT fk_uh_usuario_mod 
  FOREIGN KEY (idUsuarioModifico) 
  REFERENCES usuario(idUsuario)
  ON DELETE SET NULL;

/* Solo agregar FK de motivo si la tabla existe */
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'hardway1' 
                     AND table_name = 'motivo_inactivacion_usuario');

SET @sql = IF(@table_exists > 0,
  'ALTER TABLE usuario_historial_estado 
   ADD CONSTRAINT fk_uh_motivo 
   FOREIGN KEY (idMotivoInactivacion) 
   REFERENCES motivo_inactivacion_usuario(idMotivo)
   ON DELETE SET NULL',
  'SELECT "Tabla motivo_inactivacion_usuario no existe, FK omitida" as aviso');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/* 4. Registrar estado inicial de todos los usuarios activos */
INSERT INTO usuario_historial_estado (idUsuario, estaActivo, fechaCambio, idUsuarioModifico, observaciones)
SELECT 
  idUsuario,
  COALESCE(estaActivo, 1) as estaActivo,
  NOW() as fechaCambio,
  NULL as idUsuarioModifico,
  'Estado inicial registrado por migración' as observaciones
FROM usuario;

/* 5. Verificar migración */
SELECT 
  'Registros en historial de usuarios' as verificacion,
  COUNT(*) as total
FROM usuario_historial_estado
UNION ALL
SELECT 
  'Usuarios con historial' as verificacion,
  COUNT(DISTINCT idUsuario) as total
FROM usuario_historial_estado;
