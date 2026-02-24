#!/usr/bin/env node
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  sequelize,
  Order,
  OrderItem,
  createOrderFromPayload,
} = require("../models");

function parseArgs(argv) {
  const args = argv.slice(2);
  const getValue = (name) => {
    const index = args.findIndex((arg) => arg === name);
    if (index >= 0 && args[index + 1]) {
      return args[index + 1];
    }
    return undefined;
  };

  return {
    filePath: getValue("--file") || getValue("-f"),
  };
}

function loadOrdersFromFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Input file not found: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Input JSON must be an array of orders");
  }

  return parsed;
}

async function upsertOrder(orderPayload) {
  const orderId = orderPayload?.orderId;
  if (!orderId) {
    return { status: "skipped", reason: "missing orderId" };
  }

  const existing = await Order.findOne({ where: { orderId } });

  if (!existing) {
    await createOrderFromPayload(orderPayload);
    return { status: "created" };
  }

  await sequelize.transaction(async (transaction) => {
    await existing.update(
      {
        legacyId: orderPayload.id || existing.legacyId || null,
        date: Number(orderPayload.date || Date.now()),
        name: orderPayload.name,
        phoneNumber: orderPayload.phoneNumber,
        amount: Number(orderPayload.amount || 0),
        note: orderPayload.note || "",
        completed: !!orderPayload.completed,
        location: orderPayload.location,
        deliveryType: orderPayload.deliveryType || "dispatch-rider",
        deliveryFee: Number(orderPayload.deliveryFee || 0),
        priceOfFood: Number(orderPayload.priceOfFood || 0),
        orderPaid: !!orderPayload.orderPaid,
      },
      { transaction },
    );

    await OrderItem.destroy({
      where: { orderIdFk: existing.id },
      transaction,
    });

    const foods = Array.isArray(orderPayload.foodOrdered)
      ? orderPayload.foodOrdered
      : [];

    const packs = Array.isArray(orderPayload.numberOfPacks)
      ? orderPayload.numberOfPacks
      : [];

    const packsMap = packs.reduce((acc, current) => {
      if (current && typeof current === "object") {
        const key = Object.keys(current)[0];
        if (key) {
          const qty = Number(current[key]);
          acc[key] = Number.isFinite(qty) ? qty : 1;
        }
      }
      return acc;
    }, {});

    const items = foods.map((foodName) => ({
      orderIdFk: existing.id,
      foodName,
      quantity: packsMap[foodName] || 1,
      unitPrice: null,
    }));

    if (items.length > 0) {
      await OrderItem.bulkCreate(items, { transaction });
    }
  });

  return { status: "updated" };
}

async function main() {
  const { filePath } = parseArgs(process.argv);

  if (!filePath) {
    throw new Error(
      "Missing input file. Usage: npm run db:import-orders -- --file ./orders.json",
    );
  }

  const orders = loadOrdersFromFile(filePath);
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const order of orders) {
    const result = await upsertOrder(order);
    if (result.status === "created") created += 1;
    else if (result.status === "updated") updated += 1;
    else skipped += 1;
  }

  console.log(
    `Import complete. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
  );
}

main()
  .catch((error) => {
    console.error("Order import failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
