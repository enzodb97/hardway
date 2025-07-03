const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Persona = sequelize.define(
  "Persona",
  {
    idPersona: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dni: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    direccion: DataTypes.STRING,
    idDomicilio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Persona",
    timestamps: false,
  }
);

module.exports = Persona;
