const MongoClient = require('mongodb').MongoClient
const { merge } = require('../services/tools')

const username = process.env.MONGO_DB_USERNAME
const password = process.env.MONGO_DB_PASSWORD
const hosts = process.env.MONGO_DB_HOST
const dbname = process.env.MONGO_DB_DATABASE
const replica = process.env.MONGO_DB_REPLICA_SET
const uri = 'mongodb://localhost:27017/puppeteer' //`mongodb://${username}:${password}@${hosts}/${dbname}?authSource=${dbname}&replicaSet=${replica}&retryWrites=false`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
var settings = undefined

function connectDB(cb) {
	return new Promise((resolve, reject) => {
		client
			.connect()
			.then(() => {
				const db = client.db(dbname)
				settings = db.collection('settings')
				resolve()
			})
			.catch(err => reject(err))
	})
}

async function read(user) {
	try {
		const _id = `${user.service}:${user.id}`
		return await settings.findOne({ _id }, { projection: { _id: 0 } })
	} catch (err) {
		console.log(`mongo error: ${err}`)
		return undefined
	}
}

async function write(user, info) {
	try {
		const _id = `${user.service}:${user.id}`
		await settings.replaceOne({ _id }, { ...info, _id, name: user.name, picture: user.picture }, { upsert: true })
	} catch (err) {
		console.log(`mongo error: ${err}`)
	}
}

async function set(user, key, val) {
	const data = (await read(user)) || {}
	data[key] = val
	await write(user, data)
}

module.exports = {
	connectDB,
	read,
	write,
	set
}
