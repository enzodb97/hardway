const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MotivoNoApta = sequelize.define(
  "MotivoNoApta",
  {
    idMotivo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "motivo_no_apta",
    timestamps: false,
  }
);

module.exports = MotivoNoApta;
