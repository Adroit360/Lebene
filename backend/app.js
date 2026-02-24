require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const {
  sequelize,
  Order,
  mapOrderForClient,
  createOrderFromPayload,
  getOrderByOrderId,
  getOrdersByDateRange,
  getOrderById,
} = require("./models");

let orderStatus = false;

const port = process.env.PORT || 6000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

require("./startup/prod")(app);

app.get("/", (req, res) => {
  io.emit("orderStatus", { orderStatus });
  res.json({ orderStatus });
});

app.get("/api/messages", (req, res) => {
  const momoMessage = process.env.MOMO_ERROR_MESSAGE || "";
  res.json([
    {
      type: "momo-error",
      message: momoMessage,
    },
  ]);
});

app.get("/api/orders", async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: "startDate and endDate query params are required",
    });
  }

  try {
    const orders = await getOrdersByDateRange(startDate, endDate);
    return res.json(orders.map(mapOrderForClient));
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Failed to fetch orders",
    });
  }
});

app.patch("/api/orders/:id", async (req, res) => {
  try {
    let order = await Order.findByPk(req.params.id);
    if (!order) {
      order = await Order.findOne({ where: { legacyId: req.params.id } });
    }
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.update(req.body);
    const updatedOrder = await getOrderById(order.id);
    io.emit("ordersChanged", { id: String(order.id), action: "updated" });
    return res.json(mapOrderForClient(updatedOrder));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    let order = await Order.findByPk(req.params.id);
    if (!order) {
      order = await Order.findOne({ where: { legacyId: req.params.id } });
    }
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.destroy();
    io.emit("ordersChanged", { id: String(req.params.id), action: "deleted" });
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to delete order" });
  }
});

//cors(corsOptions),
app.post("/paystack/payment", async (req, res, next) => {
  const data = {
    amount: req.body.amount,
    email: `customer${Date.now()}@email.com`,
    reference: req.body.clientId,
    channels: ["mobile_money", "card"],
  };

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    await createOrderFromPayload(req.body.orderDetails);
    io.emit("ordersChanged", { action: "created" });
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      data,
      config,
    );
    res.json({ auth_url: response.data.data.authorization_url });
  } catch (error) {
    console.log(error);
    res.json({ error: "an uexpected error occured please try again" });
  }
});

//Callback Url Endpoint
app.post("/paystack/event", async function (req, res) {
  const data = req.body;

  try {
    if (data.event == "charge.success") {
      let order = await getOrderByOrderId(data.data.reference);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      await order.update({
        orderPaid: true,
      });

      const hydratedOrder = await getOrderById(order.id);
      if (data.data.amount !== 1) {
        await axios.post(
          "https://us-central1-delivery-system-adroit.cloudfunctions.net/postOrderToDeliverySystem",
          {
            sellerName: "Lebene",
            orderDetails: mapOrderForClient(hydratedOrder),
          },
        );
      }
      io.emit("ordersChanged", { id: String(order.id), action: "paid" });
      res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to handle payment callback" });
  }
});

app.post("/api/closeOrders", (req, res) => {
  orderStatus = true;
  io.emit("orderStatus", { orderStatus });
  res.json({ orderStatus });
});

app.post("/api/openOrders", (req, res) => {
  orderStatus = false;
  io.emit("orderStatus", { orderStatus });
  res.json({ orderStatus });
});

server.listen(port, () => {
  sequelize
    .authenticate()
    .then(() => sequelize.sync())
    .then(() => {
      console.log(`server listening on  http://localhost:${port}/`);
    })
    .catch((error) => {
      console.error("Database connection failed", error);
      process.exit(1);
    });
});

io.on("connection", (socket) => {
  console.log("a user connected");
});
