const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AsignacionPicking = sequelize.define(
  "AsignacionPicking",
  {
    idAsignacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroPedido: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    legajoPicker: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fechaAsignacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completado: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "1 = Picking completado (armado finalizado)",
    },
    despachado: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "1 = Despacho completado (envío finalizado)",
    },
    fechaCompletado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fechaDespachado: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "asignacion_picking",
    timestamps: false,
  }
);

module.exports = AsignacionPicking;
