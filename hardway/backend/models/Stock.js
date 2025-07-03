const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Stock = sequelize.define(
  "Stock",
  {
    idStock: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    codigoIndumentaria: DataTypes.STRING(50),
    idRack: DataTypes.INTEGER,
  },
  { tableName: "stock", timestamps: false }
);

module.exports = Stock;
