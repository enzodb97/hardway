const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const TipoRol = sequelize.define(
  "TipoRol",
  {
    idTipoRol: { 
      type: DataTypes.INTEGER, 
      primaryKey: true,
      autoIncrement: true 
    },
    tipoRol: DataTypes.STRING,
    descripcionRol: DataTypes.STRING,
  },
  {
    tableName: "tiporol", // Nombre en minúscula para coincidir con la BD
    timestamps: false,
  }
);

module.exports = TipoRol;
