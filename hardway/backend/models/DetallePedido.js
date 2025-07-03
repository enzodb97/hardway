const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DetallePedido = sequelize.define(
  "DetallePedido",
  {
    idDetallePedido: { type: DataTypes.STRING, primaryKey: true },
    numeroPedido: DataTypes.STRING,
    codigoIndumentaria: DataTypes.STRING,
    cantidad: DataTypes.INTEGER,
  },
  { tableName: "detallepedido", timestamps: false }
);

module.exports = DetallePedido;
