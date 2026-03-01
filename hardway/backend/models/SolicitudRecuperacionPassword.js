const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SolicitudRecuperacionPassword = sequelize.define(
  "SolicitudRecuperacionPassword",
  {
    idSolicitud: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idMotivo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    motivoSolicitud: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    codigo: {
      type: DataTypes.STRING(4),
      allowNull: false,
      defaultValue: '0000',
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'APROBADA', 'FINALIZADA', 'RECHAZADA', 'EXPIRADA'),
      defaultValue: 'PENDIENTE',
    },
    fechaSolicitud: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fechaExpiracion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaAprobacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fechaFinalizacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idAdminAprobador: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    motivoRechazo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipOrigen: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    intentosErroneos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "solicitudes_recuperacion_password",
    timestamps: false,
  }
);

module.exports = SolicitudRecuperacionPassword;
