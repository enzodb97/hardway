-- ===========================================================================
-- Migración: Poblar columnas de snapshot en pedidos existentes
-- Descripción: Actualiza los registros existentes con los valores actuales
--              de las tablas de indumentaria
-- Fecha: 2026-03-01
-- NOTA: Los valores migrados reflejan el estado ACTUAL, no el histórico
-- ===========================================================================

-- Actualizar registros existentes con datos actuales de las tablas relacionadas
UPDATE detallepedido dp
JOIN indumentaria i ON dp.codigoIndumentaria = i.codigoIndumentaria
JOIN detalleindumentaria di ON i.idDetalle = di.idDetalle
LEFT JOIN nombreindumentaria ni ON di.idNombre = ni.idNombre
LEFT JOIN precioindumentaria pr ON di.idPrecio = pr.idPrecio
LEFT JOIN color co ON di.idColor = co.idColor
LEFT JOIN talle ta ON di.idTalle = ta.idTalle
LEFT JOIN categoriaindumentaria cat ON di.idCategoria = cat.idCategoria
LEFT JOIN tela te ON di.idTela = te.idTela
LEFT JOIN presentacion_producto pp ON dp.idPresentacion = pp.idPresentacion
SET 
    dp.nombreProducto = ni.nombre,
    dp.colorProducto = co.color,
    dp.talleProducto = ta.talle,
    dp.categoriaProducto = cat.categoria,
    dp.telaProducto = te.tipoTela,
    dp.precioUnitario = pr.precio,
    dp.nombrePresentacion = pp.nombrePresentacion
WHERE 
    dp.nombreProducto IS NULL; -- Solo actualizar si no tiene valor

-- Verificar registros actualizados
-- SELECT 
--     COUNT(*) as total,
--     SUM(CASE WHEN nombreProducto IS NOT NULL THEN 1 ELSE 0 END) as con_snapshot,
--     SUM(CASE WHEN nombreProducto IS NULL THEN 1 ELSE 0 END) as sin_snapshot
-- FROM detallepedido;
