const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ConfiguracionPresentacion = sequelize.define(
  "ConfiguracionPresentacion",
  {
    idConfiguracion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigoIndumentaria: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    idPresentacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidadUnidades: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Cuántas unidades contiene esta presentación",
    },
    precioBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Precio específico para esta presentación (opcional)",
    },
    estaActivo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "configuracion_presentacion",
    timestamps: false,
  }
);

module.exports = ConfiguracionPresentacion;
