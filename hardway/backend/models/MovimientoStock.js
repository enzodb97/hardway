const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MovimientoStock = sequelize.define(
  "MovimientoStock",
  {
    idMovimientoStock: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      defaultValue: () => `MOV${Date.now()}`,
    },
    idStock: DataTypes.STRING(50),
    fechaMovimiento: DataTypes.DATE,
    cantidad: DataTypes.INTEGER,
    observaciones: DataTypes.TEXT,
  },
  { tableName: "movimientostock", timestamps: false }
);

module.exports = MovimientoStock;
