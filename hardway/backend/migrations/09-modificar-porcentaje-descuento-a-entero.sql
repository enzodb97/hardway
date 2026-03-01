-- =====================================================
-- MIGRACIÓN: Modificar porcentajeDescuento a tipo entero
-- Fecha: 2026-03-01
-- Descripción: Cambia el tipo de dato de porcentajeDescuento 
--              de DECIMAL(5,2) a INT para permitir solo números
--              enteros del 0 al 100.
-- =====================================================

-- Modificar la columna porcentajeDescuento de DECIMAL a INT
-- Primero, redondear los valores actuales por si acaso hay decimales
UPDATE `presentacion_producto`
SET `porcentajeDescuento` = ROUND(`porcentajeDescuento`);

-- Cambiar el tipo de dato a INT
ALTER TABLE `presentacion_producto`
MODIFY COLUMN `porcentajeDescuento` INT NOT NULL DEFAULT 0
COMMENT 'Porcentaje de descuento aplicado a esta presentación (0-100, solo enteros)';

-- Verificar los datos actualizados
SELECT 
    idPresentacion,
    nombrePresentacion,
    descripcion,
    porcentajeDescuento
FROM `presentacion_producto`
ORDER BY idPresentacion;
