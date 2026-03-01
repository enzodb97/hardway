-- =====================================================
-- Migración 07: Renombrar estado USADA a FINALIZADA
-- Fecha: 2026-03-01
-- Descripción: 
--   - Actualiza registros existentes de USADA a FINALIZADA
--   - Modifica ENUM del campo estado
--   - Renombra campo fechaUso a fechaFinalizacion (opcional)
-- =====================================================

USE hardway1;

-- =====================================================
-- 1. ACTUALIZAR REGISTROS EXISTENTES
-- =====================================================

-- Cambiar todos los registros con estado 'USADA' a 'FINALIZADA'
-- IMPORTANTE: Hacer esto ANTES de modificar el ENUM para no perder datos
UPDATE `solicitudes_recuperacion_password`
SET `estado` = 'FINALIZADA'
WHERE `estado` = 'USADA';

-- Verificar actualización
SELECT 
  'Registros actualizados de USADA a FINALIZADA:' AS Info,
  COUNT(*) AS Total
FROM `solicitudes_recuperacion_password`
WHERE `estado` = 'FINALIZADA';

-- =====================================================
-- 2. MODIFICAR ENUM DEL CAMPO ESTADO
-- =====================================================

-- Opción segura: crear columna temporal, copiar datos, eliminar antigua, renombrar
-- Esto evita problemas con ALTER COLUMN en algunos motores de base de datos

-- Paso 2.1: Crear columna temporal con nuevo ENUM
ALTER TABLE `solicitudes_recuperacion_password`
ADD COLUMN `estado_new` ENUM('PENDIENTE', 'APROBADA', 'FINALIZADA', 'RECHAZADA', 'EXPIRADA') 
NOT NULL DEFAULT 'PENDIENTE'
AFTER `estado`;

-- Paso 2.2: Copiar datos de estado antiguo a nuevo
UPDATE `solicitudes_recuperacion_password`
SET `estado_new` = `estado`;

-- Paso 2.3: Eliminar columna antigua
ALTER TABLE `solicitudes_recuperacion_password`
DROP COLUMN `estado`;

-- Paso 2.4: Renombrar columna nueva a estado
ALTER TABLE `solicitudes_recuperacion_password`
CHANGE COLUMN `estado_new` `estado` 
ENUM('PENDIENTE', 'APROBADA', 'FINALIZADA', 'RECHAZADA', 'EXPIRADA') 
NOT NULL DEFAULT 'PENDIENTE';

-- Paso 2.5: Recrear índice de estado (si existía)
ALTER TABLE `solicitudes_recuperacion_password`
DROP INDEX IF EXISTS `idx_estado`;

ALTER TABLE `solicitudes_recuperacion_password`
ADD KEY `idx_estado` (`estado`);

-- =====================================================
-- 3. RENOMBRAR CAMPO fechaUso a fechaFinalizacion
-- =====================================================

ALTER TABLE `solicitudes_recuperacion_password`
CHANGE COLUMN `fechaUso` `fechaFinalizacion`
DATETIME NULL
COMMENT 'Fecha y hora cuando el usuario finalizó el restablecimiento';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar ENUM actualizado
SELECT 'Verificación de ENUM actualizado:' AS Info;
SHOW COLUMNS FROM `solicitudes_recuperacion_password` LIKE 'estado';

-- Verificar que no existen registros con USADA
SELECT 
  'Registros con estado USADA (debería ser 0):' AS Info,
  COUNT(*) AS Total
FROM `solicitudes_recuperacion_password`
WHERE `estado` = 'USADA';

-- Verificar que existen registros con FINALIZADA
SELECT 
  'Registros con estado FINALIZADA:' AS Info,
  COUNT(*) AS Total
FROM `solicitudes_recuperacion_password`
WHERE `estado` = 'FINALIZADA';

-- Verificar campo renombrado
SELECT 'Campo fechaFinalizacion:' AS Info;
SHOW COLUMNS FROM `solicitudes_recuperacion_password` LIKE 'fechaFinalizacion';

-- Ver todos los estados actuales
SELECT 
  'Distribución de estados actuales:' AS Info,
  estado,
  COUNT(*) AS cantidad
FROM `solicitudes_recuperacion_password`
GROUP BY estado
ORDER BY cantidad DESC;

-- Fin de migración 07
