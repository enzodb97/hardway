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
  },
  { tableName: "detallepedido", timestamps: false }
);

module.exports = DetallePedido;
