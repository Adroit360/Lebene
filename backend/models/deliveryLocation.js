const { DataTypes } = require("sequelize");
const sequelize = require("../db/sequelize");

const DeliveryLocation = sequelize.define(
  "DeliveryLocation",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "delivery_locations",
    timestamps: true,
  },
);

module.exports = DeliveryLocation;
