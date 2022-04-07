require("dotenv").config();
const express = require("express");
const request = require("request");
const cors = require("cors");
const https = require("https");
const Redde = require("redde-nodejs-sdk");
const http = require("http");
const { Server } = require("socket.io");
const { initializeApp } = require("firebase-admin/app");
const axios = require("axios");

const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://restaurant-2a643-default-rtdb.firebaseio.com",
});

const corsOptions = {
  origin: "https://lebenebeans.com/",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// firebase database object
const db = admin.firestore();

let orderStatus = false;

const port = process.env.PORT || 6000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = [];

// app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
require("./startup/prod")(app);

app.get("/", (req, res) => {
  io.emit("orderStatus", { orderStatus });
  res.json({ orderStatus });
});

// handles post request in the api endpoint
async function post(url, data) {
  const dataString = JSON.stringify(data);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      apikey: process.env.API_KEY,
    },
    // timeout: 1000, // in ms
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const body = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => {
        const resString = Buffer.concat(body).toString();
        resolve(resString);
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request time out"));
    });

    req.write(dataString);
    req.end();
  });
}

app.post("/api/payment", cors(corsOptions), async (req, res, next) => {
  //Instantiate ReddeApi class
  const redde = new Redde(process.env.API_KEY, process.env.API_ID.toString());
  //Generating Random Client Reference
  const ref = redde.clientRef(6);
  //Generating Random Client ID
  // var clientid = redde.clientID(6);
  //Calling Receive Function
  const receive = redde.receiveMoney(
    parseFloat(req.body.amount).toFixed(2),
    req.body.paymentoption,
    req.body.walletnumber,
    ref,
    req.body.clientId
  );

  // console.log(req.body.orderDetails);

  try {
    await db.collection("orders").add(req.body.orderDetails);
    const data = await post(receive.url, receive.json);
    io.emit("notification", { data });
    res.send(data);
  } catch (error) {
    console.log(error);
    next();
  }
});

//Callback Url Endpoint
app.post("/api/reditpayment", async function (req, res) {
  const data = req.body;

  try {
    if (data.status == "PAID") {
      let order = (
        await db
          .collection("orders")
          .where("orderId", "==", data.clienttransid)
          .get()
      ).docs[0];

      await db.collection("orders").doc(order.id).update({
        orderPaid: true,
      });

      await axios.post(
        "https://us-central1-delivery-system-adroit.cloudfunctions.net/postOrderToDeliverySystem",
        {
          sellerName: "Lebene",
          orderDetails: order.data(),
        }
      );
    }

    io.emit("notification", { data });
    res.send(data);
  } catch (error) {
    console.log(error);
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
  console.log(`server listening on  http://localhost:${port}/`);
});

io.on("connection", (socket) => {
  console.log("a user connected");
});
