const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderIdFk: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    foodName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
  },
);

module.exports = OrderItem;
