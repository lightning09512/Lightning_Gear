const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductSpec = sequelize.define('ProductSpec', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  specKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  specValue: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
}, {
  tableName: 'product_specs',
  timestamps: false,
});

module.exports = ProductSpec;
