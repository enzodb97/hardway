// backend/models/MotivoModificacionPedido.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MotivoModificacionPedido = sequelize.define(
  'MotivoModificacionPedido',
  {
    idMotivo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    estaActivo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'motivo_modificacion_pedido',
    timestamps: false,
  }
);

module.exports = MotivoModificacionPedido;
