const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Rol = sequelize.define(
  "Rol",
  {
    idRol: { type: DataTypes.INTEGER, primaryKey: true },
    idTipoRol: DataTypes.INTEGER,
  },
  {
    tableName: "Rol",
    timestamps: false,
  }
);

module.exports = Rol;
