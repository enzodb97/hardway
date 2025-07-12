const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Pedido = sequelize.define(
  "Pedido",
  {
    numeroPedido: { type: DataTypes.STRING, primaryKey: true },
    idCliente: DataTypes.INTEGER,
    idEstado: DataTypes.INTEGER,
    fechaPedido: DataTypes.DATE,
    fechaModificacion: DataTypes.DATE, // Para registrar modificaciones
    codigoSeguimiento: DataTypes.STRING,
    idMotivoCancelacion: DataTypes.INTEGER, // Para el motivo de cancelación
    idUsuarioCancelo: DataTypes.INTEGER, // Para el usuario que canceló
    idUsuarioCreo: DataTypes.INTEGER, // Para el usuario que creó el pedido
    idUsuarioModifico: DataTypes.INTEGER, // Para el usuario que modificó el pedido
    observacionCancelacion: DataTypes.TEXT, // Para observaciones personalizadas de cancelación
    fechaCancelacion: DataTypes.DATE, // Para la fecha y hora exactas de cancelación
    estaActivo: DataTypes.TINYINT, // Para borrado lógico
  },
  { tableName: "pedido", timestamps: false }
);

module.exports = Pedido;
