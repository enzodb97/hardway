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
    estaActivo: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
      comment: 'Indica si el usuario está activo (1) o inactivo (0)'
    },
    idMotivoInactivacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Motivo de inactivación del usuario'
    },
    fechaInactivacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora de inactivación'
    },
    observacionInactivacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales sobre la inactivación'
    },
  },
  {
    tableName: "usuario", // Nombre en minúscula para coincidir con la BD
    timestamps: false,
  }
);

module.exports = Usuario;
