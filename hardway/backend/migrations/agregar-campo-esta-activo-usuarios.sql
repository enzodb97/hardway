/* ============================================
   Migración: Agregar campo estaActivo a tabla usuario
   Fecha: 2026-02-15
   Propósito: Implementar soft delete (usuarios inactivos)
   ============================================ */

/* Agregar columna estaActivo */
ALTER TABLE usuario 
ADD COLUMN estaActivo TINYINT(1) NOT NULL DEFAULT 1 
COMMENT 'Indica si el usuario está activo (1) o inactivo (0)';

/* Actualizar todos los usuarios existentes a activos */
UPDATE usuario 
SET estaActivo = 1 
WHERE estaActivo IS NULL;

/* Verificar migración */
SELECT 
    idUsuario,
    nombreUsuario,
    estaActivo,
    CASE 
        WHEN estaActivo = 1 THEN 'ACTIVO'
        WHEN estaActivo = 0 THEN 'INACTIVO'
        ELSE 'DESCONOCIDO'
    END AS estado_texto
FROM usuario
ORDER BY idUsuario;
