const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const webpush = require('web-push');
const PORT = process.env.PORT || 3000
// Create a new express app instance
const app = express()

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
	const dbPosts = client.db('PostBox').collection('posts');
	// perform actions on the collection object
	// Create an HTTP service.
	app.listen(PORT, () => {
		console.log('App listening on port: ', PORT)
	})

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
			await collection.insertOne(req.body);
			console.log('not exists');
		}
		res.status(200);
		res.send();
	});

	app.get('/api/isSubscribing',async (req, res) => {
		const token = req.query.token
		console.log(token)
		if(!token){
			res.status(400)
			res.json({tokenError: 'Token is not given'})
			return;
		}
		const devices = await collection.findOne({token: token})
		res.status(200)
		res.json({isSubscribing: devices ? true : false})
	})

	app.get('/api/send', (req, res) => {
		console.log('sending note...')
		sendNotification(collection, res);
	});

	app.get('/api/posts', async (req, res) => {
		res.status(200)
		res.json({value: await getPosts(dbPosts)})
	})

	app.post('/api/posts', (req, res) => {
		updatePosts(dbPosts, req.body.value)
		sendNotification(collection, res);
		res.status(200)
		res.send()
	})

	app.delete('/api/posts', (req, res) => {
		dbPosts.drop()
		res.status(200)
		res.send()
	})

	app.get('/api/batteryLevel', async (req, res) => {
		res.status(200)
		res.json({value: await getBatteryLevel(dbPosts)})
	})

	app.post('/api/batteryLevel', (req, res) => {
		updateBatteryLevel(dbPosts, req.body.value)
		res.status(200)
		res.send()
	})
});

async function getPosts(posts){
		const post = await posts.findOne({name: 'posts'})
		return post ? post.value : 0
}

async function updatePosts(posts, val){
	await posts.updateOne({name: 'posts'}, {$inc: {value: val}}, {upsert: true})
}

async function getBatteryLevel(posts){
	const post = await posts.findOne({name: 'posts'})
	return post ? post.battery : 0
}

async function updateBatteryLevel(posts, val){
	await posts.updateOne({name: 'posts'}, {$set: {battery: val}}, {upsert: true})
}

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
