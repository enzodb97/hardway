const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Color = sequelize.define(
  "Color",
  {
    idColor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    color: DataTypes.STRING,
  },
  { tableName: "Color", timestamps: false }
);

const Talle = sequelize.define(
  "Talle",
  {
    idTalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    talle: DataTypes.STRING,
  },
  { tableName: "Talle", timestamps: false }
);

const Tela = sequelize.define(
  "Tela",
  {
    idTela: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipoTela: DataTypes.STRING,
  },
  { tableName: "Tela", timestamps: false }
);

const CategoriaIndumentaria = sequelize.define(
  "CategoriaIndumentaria",
  {
    idCategoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoria: DataTypes.STRING,
  },
  { tableName: "CategoriaIndumentaria", timestamps: false }
);

const EstadoIndumentaria = sequelize.define(
  "EstadoIndumentaria",
  {
    idEstado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estadoIndumentaria: DataTypes.STRING,
  },
  { tableName: "EstadoIndumentaria", timestamps: false }
);

const PrecioIndumentaria = sequelize.define(
  "PrecioIndumentaria",
  {
    idPrecio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    precio: DataTypes.DOUBLE,
  },
  { tableName: "PrecioIndumentaria", timestamps: false }
);

const NombreIndumentaria = sequelize.define(
  "NombreIndumentaria",
  {
    idNombre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: DataTypes.STRING,
  },
  { tableName: "nombreindumentaria", timestamps: false }
);

module.exports = {
  Color,
  Talle,
  Tela,
  CategoriaIndumentaria,
  EstadoIndumentaria,
  PrecioIndumentaria,
  NombreIndumentaria,
};
