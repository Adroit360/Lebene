#!/usr/bin/env node
/*
 * Export unique phone numbers from paid orders in MySQL to phones.csv.
 * Usage:
 *   node scripts/export-paid-phones.js
 */

const fs = require("fs");
const path = require("path");
const { sequelize, Order } = require("../../backend/models");

async function fetchPaidPhoneNumbers() {
  const orders = await Order.findAll({
    attributes: ["phoneNumber"],
    where: { orderPaid: true },
    raw: true,
  });
  const phones = new Set();

  orders.forEach((order) => {
    const phone = order.phoneNumber;
    if (typeof phone === "string" && phone.trim()) {
      phones.add(phone.trim());
    }
  });

  return Array.from(phones);
}

function writeCsv(phones, outputPath) {
  const lines = ["phoneNumber", ...phones];
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  await sequelize.authenticate();
  const phones = await fetchPaidPhoneNumbers();

  const outputPath = path.resolve(process.cwd(), "phones.csv");
  writeCsv(phones, outputPath);

  console.log(
    `Exported ${phones.length} unique phone numbers to ${outputPath}`,
  );
}

main()
  .catch((err) => {
    console.error("Failed to export phone numbers:", err.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
