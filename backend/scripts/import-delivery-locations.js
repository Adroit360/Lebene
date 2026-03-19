#!/usr/bin/env node
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize, DeliveryLocation } = require("../models");

function parseArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

function parseFromJson(raw) {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON file must contain an array of locations");
  }

  return parsed
    .map((item) => ({
      name: String(item?.name || "").trim(),
      price: Number(item?.price || 0),
    }))
    .filter((item) => item.name && Number.isFinite(item.price));
}

function parseFromTs(raw) {
  const content = raw.replace(/^\s*\/\/.*$/gm, "");
  const regex =
    /\{\s*name:\s*['\"]([^'\"]+)['\"]\s*,\s*price:\s*([0-9]+(?:\.[0-9]+)?)\s*\}/g;
  const rows = [];
  let match = regex.exec(content);

  while (match) {
    rows.push({
      name: String(match[1] || "").trim(),
      price: Number(match[2] || 0),
    });
    match = regex.exec(content);
  }

  return rows.filter((item) => item.name && Number.isFinite(item.price));
}

function normalizeRows(rows) {
  const deduped = new Map();

  rows.forEach((row) => {
    const key = row.name.toLowerCase();
    deduped.set(key, {
      name: row.name,
      price: Number(row.price || 0),
    });
  });

  return Array.from(deduped.values());
}

async function main() {
  const sourceFile =
    parseArg("--file") ||
    path.resolve(__dirname, "../../restaurant-website/src/app/models/accra.ts");

  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  const ext = path.extname(sourceFile).toLowerCase();
  const raw = fs.readFileSync(sourceFile, "utf8");

  const parsedRows = ext === ".json" ? parseFromJson(raw) : parseFromTs(raw);
  const rows = normalizeRows(parsedRows);

  if (rows.length === 0) {
    throw new Error("No delivery locations found in source file");
  }

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  await DeliveryLocation.bulkCreate(rows, {
    updateOnDuplicate: ["price", "updatedAt"],
  });

  console.log(`Imported ${rows.length} delivery locations successfully.`);
}

main()
  .catch((error) => {
    console.error("Delivery locations import failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
