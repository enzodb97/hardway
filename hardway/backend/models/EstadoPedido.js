const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const EstadoPedido = sequelize.define(
  "EstadoPedido",
  {
    idEstado: { type: DataTypes.INTEGER, primaryKey: true },
    tipoEstado: DataTypes.STRING,
  },
  { tableName: "estadopedido", timestamps: false }
);

module.exports = EstadoPedido;
