/* ============================================
   Migración: Sistema de motivos de inactivación de usuarios
   Fecha: 2026-02-15
   Propósito: Agregar trazabilidad y auditoría a la baja de usuarios
   ============================================ */

/* 1. Crear tabla de motivos de inactivación */
CREATE TABLE IF NOT EXISTS motivo_inactivacion_usuario (
  idMotivo INT PRIMARY KEY AUTO_INCREMENT,
  descripcion VARCHAR(100) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  UNIQUE KEY unique_descripcion (descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* 2. Insertar motivos predefinidos */
INSERT INTO motivo_inactivacion_usuario (descripcion) VALUES 
('Desvinculación laboral'),
('Detección de fraude'),
('Errores recurrentes'),
('Inactividad prolongada'),
('Otros')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

/* 3. Agregar campos de auditoría a tabla usuario */
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS idMotivoInactivacion INT NULL COMMENT 'Motivo de inactivación del usuario',
ADD COLUMN IF NOT EXISTS fechaInactivacion DATETIME NULL COMMENT 'Fecha y hora de inactivación',
ADD COLUMN IF NOT EXISTS observacionInactivacion TEXT NULL COMMENT 'Observaciones adicionales sobre la inactivación',
ADD CONSTRAINT fk_usuario_motivo_inactivacion 
  FOREIGN KEY (idMotivoInactivacion) 
  REFERENCES motivo_inactivacion_usuario(idMotivo)
  ON DELETE SET NULL;

/* 4. Verificar migración */
SELECT 
    'Motivos de inactivación' as tabla,
    COUNT(*) as registros
FROM motivo_inactivacion_usuario
UNION ALL
SELECT 
    'Usuarios con campos agregados' as tabla,
    COUNT(*) as registros
FROM information_schema.COLUMNS 
WHERE TABLE_NAME = 'usuario' 
  AND COLUMN_NAME IN ('idMotivoInactivacion', 'fechaInactivacion', 'observacionInactivacion');
