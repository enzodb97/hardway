const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Cliente = sequelize.define(
  "Cliente",
  {
    idCliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: DataTypes.STRING,
    telefono: DataTypes.STRING,
    estaActivo: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    idPersona: DataTypes.INTEGER,
  },
  {
    tableName: "Cliente",
    timestamps: false,
  }
);

module.exports = Cliente;
