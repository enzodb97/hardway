const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MotivoInactivacionUsuario = sequelize.define(
  "MotivoInactivacionUsuario",
  {
    idMotivo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    activo: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
    },
  },
  {
    tableName: "motivo_inactivacion_usuario",
    timestamps: false,
  }
);

module.exports = MotivoInactivacionUsuario;
