const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Domicilio = sequelize.define('Domicilio', {
  idDomicilio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  calle: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  altura: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  piso: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  idBarrio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idCiudad: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'domicilio',
  timestamps: false
});

module.exports = Domicilio;
