const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Domicilio = sequelize.define(
  "Domicilio",
  {
    idDomicilio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    calle: DataTypes.STRING,
    altura: DataTypes.STRING,
    piso: DataTypes.STRING,
    departamento: DataTypes.STRING,
    observaciones: DataTypes.STRING,
    idBarrio: DataTypes.INTEGER,
    idCiudad: DataTypes.INTEGER,
  },
  {
    tableName: "domicilio",
    timestamps: false,
  }
);

const Barrio = sequelize.define(
  "Barrio",
  {
    idBarrio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreBarrio: DataTypes.STRING,
    idCiudad: DataTypes.INTEGER,
  },
  {
    tableName: "barrio",
    timestamps: false,
  }
);

const Ciudad = sequelize.define(
  "Ciudad",
  {
    idCiudad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreCiudad: DataTypes.STRING,
    codigoPostal: DataTypes.STRING,
  },
  {
    tableName: "ciudad",
    timestamps: false,
  }
);

module.exports = { Domicilio, Barrio, Ciudad };
