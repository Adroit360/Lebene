#!/usr/bin/env node
require("dotenv").config();
const { sequelize } = require("../models");

async function main() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log("Schema sync completed successfully.");
}

main()
  .catch((error) => {
    console.error("Schema sync failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
