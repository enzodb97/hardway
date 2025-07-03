const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ciudad = sequelize.define('Ciudad', {
  idCiudad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombreCiudad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  codigoPostal: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'ciudad',
  timestamps: false
});

module.exports = Ciudad;
