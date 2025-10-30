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
    // idRol eliminado - ahora la relación es N:M a través de usuario_tiporol
    idPersona: DataTypes.INTEGER,
  },
  {
    tableName: "usuario", // Nombre en minúscula para coincidir con la BD
    timestamps: false,
  }
);

module.exports = Usuario;
