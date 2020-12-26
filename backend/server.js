const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const webpush = require('web-push');

var https = require('https');
var http = require('http');
var fs = require('fs');
// Create a new express app instance
const app = express();

var options = {
  key: fs.readFileSync('client-key.pem'),
  cert: fs.readFileSync('client-cert.pem')
};

const vapidKeys = {
	publicKey  : 'BL0PoiuUFuwDpl2nwta9GAgXwhCzjPkBFZBm-Tf5wzItLwhg5CqNbQWUscBQl7uzZbse-rNVpIklXdmVPIitEzA',
	privateKey : process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails('mailto:kamil.pieronczyk@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

const notificationPayload = {
	notification : {
		title   : 'PostBox',
		body    : 'You have new posts!',
		icon    : 'assets/favicon.ico',
		vibrate : [ 100, 50, 100 ],
		data    : {
			dateOfArrival : Date.now(),
			primaryKey    : 1
		}
	}
};

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_DB;

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
	const collection = client.db('PostBox').collection('devices');
	// perform actions on the collection object
	// Create an HTTP service.
	http.createServer(app).listen(80);
	// Create an HTTPS service identical to the HTTP service.
	https.createServer(options, app).listen(443);

	app.use(bodyParser.json());

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token');
		res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
		next();
	});

	app.post('/api/subscribe', async (req, res) => {
		console.log('/subscribe');
		try {
			await checkIfDeviceExist(collection, req.body.token);
			console.log('exists');
		} catch (e) {
			collection.insertOne(req.body).catch((e) => console.log(e));
			console.log('not exists');
		}
		res.status(200);
		res.send();
	});

	app.get('/api/send', (req, res) => {
		sendNotification(collection, res);
	});
});

function checkIfDeviceExist(collection, token) {
	return new Promise((resolve, reject) => {
		collection.findOne({ token: token }, (err, result) => {
			if (err || result == null) return reject();
			resolve(result);
		});
	});
}

function sendNotification(collection, res) {
	collection.find().forEach((doc) => {
		webpush
			.sendNotification(doc.sub, JSON.stringify(notificationPayload))
			.then(() => res.status(200).json({ message: 'Newsletter sent successfully.' }))
			.catch((err) => {
				console.error('Error sending notification, reason: ', err);
				res.sendStatus(500);
			});
	});
}
