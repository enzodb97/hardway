const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StockRegistroFallo = sequelize.define(
  "StockRegistroFallo",
  {
    idRegistroFallo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    idStock: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: "stock",
        key: "idStock",
      },
    },
    idMotivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "motivo_no_apta",
        key: "idMotivo",
      },
    },
    idRackOriginal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Rack donde estaba la indumentaria antes de ser marcada como No Apta",
      references: {
        model: "rack",
        key: "idRack",
      },
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estadoPostFallo: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: "1 = Apta (Reparado), NULL = Pendiente o Scrap (ver observaciones)",
      validate: {
        isIn: [[1, null]], // Solo 1 o NULL permitidos (0 causaba conflicto con FK)
      },
    },
    fechaResolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Fecha en que se resolvió el fallo (reparación o scrap)",
    },
    idUsuarioResolucion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuario",
        key: "idUsuario",
      },
    },
  },
  {
    tableName: "stock_registro_fallo",
    timestamps: false,
  }
);

module.exports = StockRegistroFallo;
