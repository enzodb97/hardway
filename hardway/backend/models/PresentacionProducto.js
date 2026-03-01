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
    porcentajeDescuento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
        isInt: {
          msg: 'El porcentaje debe ser un número entero'
        }
      },
      comment: 'Porcentaje de descuento aplicado a esta presentación (0-100)',
    },
  },
  {
    tableName: "presentacion_producto",
    timestamps: false,
  }
);

module.exports = PresentacionProducto;
