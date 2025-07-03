const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TipoRol = sequelize.define(
  "TipoRol",
  {
    idTipoRol: { type: DataTypes.INTEGER, primaryKey: true },
    tipoRol: DataTypes.STRING,
    descripcionRol: DataTypes.STRING,
  },
  {
    tableName: "TipoRol",
    timestamps: false,
  }
);

module.exports = TipoRol;
