const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DetallePedido = sequelize.define(
  "DetallePedido",
  {
    idDetallePedido: { type: DataTypes.STRING, primaryKey: true },
    numeroPedido: DataTypes.STRING,
    codigoIndumentaria: DataTypes.STRING,
    cantidad: DataTypes.INTEGER,
    descuentoItem: DataTypes.DECIMAL(10, 2), // Descuento por ítem
    idPresentacion: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "FK a presentacion_producto",
    },
    cantidadPresentaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Cuántas cajas/packs se vendieron",
    },
    unidadesTotales: {
      type: DataTypes.INTEGER,
      comment: "Total de unidades (calculado)",
    },
    // Columnas de snapshot para preservar datos históricos del producto
    nombreProducto: {
      type: DataTypes.STRING(100),
      comment: "Nombre del producto al momento del pedido",
    },
    colorProducto: {
      type: DataTypes.STRING(50),
      comment: "Color del producto al momento del pedido",
    },
    talleProducto: {
      type: DataTypes.STRING(20),
      comment: "Talle del producto al momento del pedido",
    },
    categoriaProducto: {
      type: DataTypes.STRING(50),
      comment: "Categoría del producto al momento del pedido",
    },
    telaProducto: {
      type: DataTypes.STRING(50),
      comment: "Tela del producto al momento del pedido",
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "Precio unitario al momento del pedido",
    },
    nombrePresentacion: {
      type: DataTypes.STRING(50),
      comment: "Nombre de la presentación al momento del pedido",
    },
  },
  { tableName: "detallepedido", timestamps: false }
);

module.exports = DetallePedido;
