const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DetalleIndumentaria = sequelize.define(
  "DetalleIndumentaria",
  {
    idDetalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idPrecio: DataTypes.INTEGER,
    idCategoria: DataTypes.INTEGER,
    idColor: DataTypes.INTEGER,
    idTalle: DataTypes.INTEGER,
    idEstado: DataTypes.INTEGER,
    idTela: DataTypes.INTEGER,
    idNombre: DataTypes.INTEGER,
  },
  { tableName: "detalleindumentaria", timestamps: false }
);

module.exports = DetalleIndumentaria;
