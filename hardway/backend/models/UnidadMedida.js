const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UnidadMedida = sequelize.define(
  "UnidadMedida",
  {
    idUnidadMedida: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreUnidad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    abreviatura: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { tableName: "unidad_medida", timestamps: false }
);

module.exports = UnidadMedida;
