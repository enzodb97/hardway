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
    tieneProblemas: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "1 = Se reportaron problemas durante el picking",
    },
    idMotivoProblema: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "FK a motivo_no_apta - Motivo del problema reportado",
    },
    observacionesProblema: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Detalle adicional del problema reportado por el picker",
    },
    idDetallePedidoProblema: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "ID del detalle de pedido con problema",
    },
    cantidadConProblema: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Cantidad de unidades del artículo con problema",
    },
    completarParcial: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: "1 = Picker decidió completar parcialmente el pedido con el problema",
    },
  },
  {
    tableName: "asignacion_picking",
    timestamps: false,
  }
);

module.exports = AsignacionPicking;
