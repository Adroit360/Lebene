require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://restaurant-2a643-default-rtdb.firebaseio.com',
});

// firebase database object
const db = admin.firestore();

let orderStatus = false;

const port = process.env.PORT || 6000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

require('./startup/prod')(app);

app.get('/', (req, res) => {
	io.emit('orderStatus', { orderStatus });
	res.json({ orderStatus });
});

//cors(corsOptions),
app.post('/paystack/payment', async (req, res, next) => {
	const data = {
		amount: req.body.amount,
		email: `customer${Date.now()}@email.com`,
		reference: req.body.clientId,
		channels: ['mobile_money', 'card'],
	};

	const config = {
		headers: {
			Authorization: `Bearer ${process.env.API_KEY}`,
			'Content-Type': 'application/json',
		},
	};

	try {
		await db.collection('orders').add(req.body.orderDetails);
		const response = await axios.post(
			'https://api.paystack.co/transaction/initialize',
			data,
			config
		);
		res.json({ auth_url: response.data.data.authorization_url });
	} catch (error) {
		console.log(error);
		res.json({ error: 'an uexpected error occured please try again' });
	}
});

//Callback Url Endpoint
app.post('/paystack/event', async function (req, res) {
	const data = req.body;

	try {
		if (data.event == 'charge.success') {
			let order = (await db.collection('orders').where('orderId', '==', data.data.reference).get())
				.docs[0];
			await db.collection('orders').doc(order.id).update({
				orderPaid: true,
			});
			if (data.data.amount !== 1) {
				await axios.post(
					'https://us-central1-delivery-system-adroit.cloudfunctions.net/postOrderToDeliverySystem',
					{
						sellerName: 'Lebene',
						orderDetails: order.data(),
					}
				);
			}
			res.send(200);
		}
	} catch (error) {
		console.log(error);
	}
});

app.post('/api/closeOrders', (req, res) => {
	orderStatus = true;
	io.emit('orderStatus', { orderStatus });
	res.json({ orderStatus });
});

app.post('/api/openOrders', (req, res) => {
	orderStatus = false;
	io.emit('orderStatus', { orderStatus });
	res.json({ orderStatus });
});

server.listen(port, () => {
	console.log(`server listening on  http://localhost:${port}/`);
});

io.on('connection', (socket) => {
	console.log('a user connected');
});
