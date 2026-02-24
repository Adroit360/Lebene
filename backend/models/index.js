const { Op } = require("sequelize");
const sequelize = require("../db/sequelize");
const Order = require("./order");
const OrderItem = require("./orderItem");

Order.hasMany(OrderItem, {
  foreignKey: "orderIdFk",
  as: "items",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderIdFk",
  as: "order",
});

function parseNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function itemsFromPayload(orderDetails) {
  const foodOrdered = Array.isArray(orderDetails.foodOrdered)
    ? orderDetails.foodOrdered
    : [];

  const packsArray = Array.isArray(orderDetails.numberOfPacks)
    ? orderDetails.numberOfPacks
    : [];

  const packsByFood = packsArray.reduce((acc, curr) => {
    if (curr && typeof curr === "object") {
      const foodName = Object.keys(curr)[0];
      if (foodName) {
        acc[foodName] = parseNumber(curr[foodName], 1);
      }
    }
    return acc;
  }, {});

  return foodOrdered.map((foodName) => ({
    foodName,
    quantity: packsByFood[foodName] || 1,
  }));
}

function mapOrderForClient(orderInstance) {
  const rawOrder = orderInstance.get({ plain: true });
  const items = Array.isArray(rawOrder.items) ? rawOrder.items : [];

  return {
    Id: String(rawOrder.id),
    id: rawOrder.legacyId || String(rawOrder.id),
    legacyId: rawOrder.legacyId || null,
    date: String(rawOrder.date),
    orderId: rawOrder.orderId,
    name: rawOrder.name,
    foodOrdered: items.map((item) => item.foodName),
    phoneNumber: rawOrder.phoneNumber,
    amount: String(rawOrder.amount),
    note: rawOrder.note || "",
    completed: !!rawOrder.completed,
    location: rawOrder.location,
    deliveryType: rawOrder.deliveryType,
    deliveryFee: parseNumber(rawOrder.deliveryFee),
    priceOfFood: String(rawOrder.priceOfFood),
    orderPaid: !!rawOrder.orderPaid,
    numberOfPacks: items.map((item) => ({
      [item.foodName]: parseNumber(item.quantity, 1),
    })),
  };
}

async function createOrderFromPayload(orderDetails) {
  const created = await sequelize.transaction(async (transaction) => {
    const order = await Order.create(
      {
        orderId: orderDetails.orderId,
        legacyId: orderDetails.id || null,
        date: parseNumber(orderDetails.date, Date.now()),
        name: orderDetails.name,
        phoneNumber: orderDetails.phoneNumber,
        amount: parseNumber(orderDetails.amount),
        note: orderDetails.note || "",
        completed: !!orderDetails.completed,
        location: orderDetails.location,
        deliveryType: orderDetails.deliveryType || "dispatch-rider",
        deliveryFee: parseNumber(orderDetails.deliveryFee),
        priceOfFood: parseNumber(orderDetails.priceOfFood),
        orderPaid: !!orderDetails.orderPaid,
      },
      { transaction },
    );

    const items = itemsFromPayload(orderDetails).map((item) => ({
      orderIdFk: order.id,
      foodName: item.foodName,
      quantity: item.quantity,
      unitPrice: null,
    }));

    if (items.length > 0) {
      await OrderItem.bulkCreate(items, { transaction });
    }

    return order;
  });

  return getOrderById(created.id);
}

async function getOrderById(id) {
  return Order.findByPk(id, {
    include: [{ model: OrderItem, as: "items" }],
  });
}

async function getOrderByOrderId(orderId) {
  return Order.findOne({
    where: { orderId },
    include: [{ model: OrderItem, as: "items" }],
  });
}

async function getOrdersByDateRange(startDate, endDate) {
  return Order.findAll({
    where: {
      date: {
        [Op.gte]: parseNumber(startDate, 0),
        [Op.lte]: parseNumber(endDate, Date.now()),
      },
    },
    include: [{ model: OrderItem, as: "items" }],
    order: [["date", "DESC"]],
  });
}

module.exports = {
  sequelize,
  Op,
  Order,
  OrderItem,
  mapOrderForClient,
  createOrderFromPayload,
  getOrderByOrderId,
  getOrdersByDateRange,
  getOrderById,
};
