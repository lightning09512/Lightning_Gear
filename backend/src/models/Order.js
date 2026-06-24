const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 0),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay', 'credit_card', 'installment'),
    allowNull: false,
    defaultValue: 'cod',
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
});

module.exports = Order;
