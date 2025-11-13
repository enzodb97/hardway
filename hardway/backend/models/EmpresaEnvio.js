const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const EmpresaEnvio = sequelize.define(
  "EmpresaEnvio",
  {
    idEmpresaEnvio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "empresa_envio",
    timestamps: false,
  }
);

module.exports = EmpresaEnvio;
