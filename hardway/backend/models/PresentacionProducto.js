const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PresentacionProducto = sequelize.define(
  "PresentacionProducto",
  {
    idPresentacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombrePresentacion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "presentacion_producto",
    timestamps: false,
  }
);

module.exports = PresentacionProducto;
