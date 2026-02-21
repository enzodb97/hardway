const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const NotificacionPedido = sequelize.define(
  "NotificacionPedido",
  {
    idNotificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numeroPedido: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Pedido relacionado con la notificación",
    },
    idUsuarioDestino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Usuario que debe recibir la notificación (generalmente el vendedor)",
    },
    tipoNotificacion: {
      type: DataTypes.ENUM('problema_picking', 'cambio_estado', 'cancelacion', 'resolucion_vendedor', 'otro'),
      defaultValue: 'problema_picking',
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Contenido de la notificación",
    },
    fechaNotificacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    leida: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
      comment: "0 = No leída, 1 = Leída",
    },
    fechaLectura: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha en que se marcó como leída",
    },
    idAsignacionPicking: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Referencia opcional a la asignación de picking",
    },
    estadoResolucion: {
      type: DataTypes.ENUM('pendiente', 'resuelto', 'rechazado'),
      defaultValue: 'pendiente',
      allowNull: false,
      comment: "Estado de la resolución de la notificación",
    },
    tipoResolucion: {
      type: DataTypes.ENUM(
        'cancelar_articulo',
        'reducir_cantidad',
        'producto_alternativo',
        'reabastecer',
        'continuar',
        'cancelar_pedido'
      ),
      allowNull: true,
      comment: "Tipo de resolución aplicada por el vendedor",
    },
    idUsuarioResolvio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Usuario (vendedor) que resolvió la notificación",
    },
    fechaResolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha y hora en que se resolvió",
    },
    observacionesResolucion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observaciones/instrucciones del vendedor sobre la resolución",
    },
    codigoIndumentariaAlternativo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Si se usó producto alternativo, código del reemplazo",
    },
    nuevaCantidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Si se redujo cantidad, nueva cantidad autorizada",
    },
  },
  {
    tableName: "notificacion_pedido",
    timestamps: false,
  }
);

module.exports = NotificacionPedido;
