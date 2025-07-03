const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Indumentaria = sequelize.define(
  "Indumentaria",
  {
    codigoIndumentaria: { type: DataTypes.STRING, primaryKey: true },
    idDetalle: DataTypes.INTEGER,
  },
  { tableName: "indumentaria", timestamps: false }
);

module.exports = Indumentaria;
