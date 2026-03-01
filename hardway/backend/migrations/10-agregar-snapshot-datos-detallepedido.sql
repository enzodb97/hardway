-- ===========================================================================
-- Migración: Agregar columnas de snapshot a detallepedido
-- Descripción: Preserva los datos del producto al momento de crear el pedido
--              para evitar que cambios posteriores afecten pedidos históricos
-- Fecha: 2026-03-01
-- ===========================================================================

-- Agregar columnas para almacenar snapshot de datos del producto
ALTER TABLE detallepedido 
ADD COLUMN nombreProducto VARCHAR(100) DEFAULT NULL COMMENT 'Nombre del producto al momento del pedido',
ADD COLUMN colorProducto VARCHAR(50) DEFAULT NULL COMMENT 'Color del producto al momento del pedido',
ADD COLUMN talleProducto VARCHAR(20) DEFAULT NULL COMMENT 'Talle del producto al momento del pedido',
ADD COLUMN categoriaProducto VARCHAR(50) DEFAULT NULL COMMENT 'Categoría del producto al momento del pedido',
ADD COLUMN telaProducto VARCHAR(50) DEFAULT NULL COMMENT 'Tela del producto al momento del pedido',
ADD COLUMN precioUnitario DECIMAL(10,2) DEFAULT NULL COMMENT 'Precio unitario al momento del pedido',
ADD COLUMN nombrePresentacion VARCHAR(50) DEFAULT NULL COMMENT 'Nombre de la presentación al momento del pedido';

-- Crear índices para mejorar performance en consultas
CREATE INDEX idx_detallepedido_numeropedido ON detallepedido(numeroPedido);

-- Verificar estructura actualizada
-- SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'detallepedido' AND TABLE_SCHEMA = DATABASE();
