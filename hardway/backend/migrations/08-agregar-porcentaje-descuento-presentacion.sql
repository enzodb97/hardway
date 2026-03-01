-- =====================================================
-- MIGRACIÓN: Agregar porcentaje de descuento a presentaciones
-- Fecha: 2026-03-01
-- Descripción: Agrega columna porcentajeDescuento a la tabla
--              presentacion_producto para hacer los descuentos
--              configurables desde la interfaz de administración.
-- =====================================================

-- Agregar columna porcentajeDescuento a la tabla presentacion_producto
ALTER TABLE `presentacion_producto`
ADD COLUMN `porcentajeDescuento` DECIMAL(5,2) NOT NULL DEFAULT 0.00
COMMENT 'Porcentaje de descuento aplicado a esta presentación (0-100)'
AFTER `descripcion`;

-- NOTA: La validación del rango 0-100 se realiza en el backend (modelo Sequelize)
-- y en el frontend (validación de formulario)

-- Establecer valores por defecto según los porcentajes actuales del sistema
-- Unidad: Sin descuento (0%)
UPDATE `presentacion_producto`
SET `porcentajeDescuento` = 0.00
WHERE `idPresentacion` = 1;

-- Caja Cerrada: 10% de descuento
UPDATE `presentacion_producto`
SET `porcentajeDescuento` = 10.00
WHERE `idPresentacion` = 2;

-- Pack: 5% de descuento
UPDATE `presentacion_producto`
SET `porcentajeDescuento` = 5.00
WHERE `idPresentacion` = 3;

-- Verificar los datos actualizados
SELECT 
    idPresentacion,
    nombrePresentacion,
    descripcion,
    porcentajeDescuento
FROM `presentacion_producto`
ORDER BY idPresentacion;
