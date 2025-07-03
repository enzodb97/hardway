const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PedidoIndumentaria = sequelize.define(
  "PedidoIndumentaria",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pedido_id: { type: DataTypes.INTEGER },
    idIndumentaria: { type: DataTypes.INTEGER },
    cantidad: { type: DataTypes.INTEGER },
  },
  {
    tableName: "pedido_indumentaria",
    timestamps: false,
  }
);

module.exports = PedidoIndumentaria;
