const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MotivoRecuperacionPassword = sequelize.define(
  "MotivoRecuperacionPassword",
  {
    idMotivo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "motivos_recuperacion_password",
    timestamps: false,
  }
);

module.exports = MotivoRecuperacionPassword;
