const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Usuario = sequelize.define(
  "Usuario",
  {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreUsuario: DataTypes.STRING,
    contrasena: DataTypes.STRING,
    idRol: DataTypes.INTEGER,
    idPersona: DataTypes.INTEGER, // Campo faltante
  },
  {
    tableName: "Usuario",
    timestamps: false,
  }
);

module.exports = Usuario;
