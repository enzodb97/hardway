// backend/models/HistorialModificacionPedido.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HistorialModificacionPedido = sequelize.define(
  'HistorialModificacionPedido',
  {
    idHistorial: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroPedido: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fechaModificacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    idUsuarioModifico: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idMotivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipoModificacion: {
      type: DataTypes.ENUM('Envio', 'Se agrego un producto', 'Se elimino un producto', 'Se modifico la cantidad de un producto'),
      allowNull: false,
    },
    valorAnterior: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    valorNuevo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    idDetallePedido: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    codigoIndumentaria: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cantidadAnterior: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cantidadNueva: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'historial_modificacion_pedido',
    timestamps: false,
  }
);

module.exports = HistorialModificacionPedido;
