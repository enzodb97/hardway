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
    dni: DataTypes.STRING,
    tipoDocumento: {
      type: DataTypes.ENUM('DNI', 'CUIL', 'CUIT'),
      allowNull: true,
      defaultValue: 'DNI',
    },
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
