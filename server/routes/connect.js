const peers = require('../services/peers')
const storage = require('../services/storage')
const tools = require('../services/tools')
const { encode, parse } = require('../services/bson')

var counter = 0
var debugCommands = true

var defaultSettings = {
	game: undefined,
	info: {
		online: false,
		title: '',
		matureOnly: false,
	},
	viewing: {},
}

async function helloGame(n, user, ws) {
	const settings = await storage.read(user)
	if (!settings || !settings.game || settings.game != user.game) {
		console.log(`#${n} game not whitelisted`)
		return undefined
	}
	if (debugCommands) console.log(`NEW GAME #${n} ${user.service}:${user.id}:${user.game}`)
	var client = peers.findClient(user)
	if (!client) {
		if (debugCommands) console.log(`#${n} adding default viewer`)
		client = peers.addClient('GAME', user, {
			ws: undefined,
			online: settings.info.online,
			title: settings.info.title,
			matureOnly: settings.info.matureOnly,
		})
		if (!client) {
			console.log(`#${n} could not add client`)
			return undefined
		}
	}
	if (debugCommands) console.log(`#${n} adding game`)
	peers.addGame(client, ws)
	ws.sendEncoded({ type: 'welcome' })
	return client
}

async function helloViewer(n, user, ws) {
	if (debugCommands) console.log(`NEW VIEWER #${n} ${user.service}:${user.id}:${user.name}:${user.picture ? 'pic' : 'nopic'}`)
	let settings = await storage.read(user)
	if (!settings.info) settings = defaultSettings
	if (debugCommands) console.log(`#${n} settings: ${JSON.stringify(settings)}`)
	const info = settings.info
	if (debugCommands) console.log(`#${n} adding viewer ${user.service}:${user.id}:${user.name}:${user.picture ? 'pic' : 'nopic'}`)
	const client = peers.addClient('VIEWER', user, {
		ws,
		online: info.online,
		title: info.title,
		matureOnly: info.matureOnly,
	})
	if (!client) {
		console.log(`#${n} could not add client`)
		return undefined
	}
	const status = {
		user: client.user,
		game: client.game,
		viewers: client.viewers.length,
	}
	ws.sendEncoded({ type: 'status', status })
	ws.sendEncoded({ type: 'settings', settings })
	const streamers = peers.availableStreamers()
	ws.sendEncoded({ type: 'streamers', streamers })
	return client
}

async function connect(ws, req) {
	const user = req.user
	if (!user) {
		console.log('# weird: user == null')
		ws.close()
		return
	}

	ws.sendEncoded = (obj) => ws.send(encode(obj))
	const n = ++counter

	var client = user.game ? await helloGame(n, user, ws) : await helloViewer(n, user, ws)
	if (!client) {
		ws.close()
		return
	}

	const gameMessage = async (msg) => {
		switch (msg.type) {
			case 'colonists':
				if (debugCommands) console.log(`#${n} [game] ${msg.type} ${JSON.stringify(msg.colonists)}`)
				peers.colonists(client, msg.colonists)
				return

			case 'assignment':
				if (debugCommands) console.log(`#${n} [game] ${msg.type} ${msg.viewer.service}:${msg.viewer.id} ${msg.state}`)
				peers.assignment(client, msg.viewer, msg.state)
				return

			case 'earn':
			case 'portrait':
			case 'on-map':
			case 'colonist-basics':
				// if (debugCommands) console.log(`#${n} [game] ${msg.type} ${msg.info}`)
				peers.gameMessage(msg.type, msg.viewer, msg.info)
				return

			case 'state':
				if (debugCommands) console.log(`#${n} [game] ${msg.type} ${msg.key} ${JSON.stringify(msg.val)}`)
				peers.setClientState(client, msg.viewer, msg.key, msg.val)
				return

			case 'job':
				if (debugCommands) console.log(`#${n} [game] ${msg.type} ${msg.id} ${msg.info}`)
				peers.returnJobResult(client, msg.viewer, msg.id, msg.info)
				return
		}
		console.log(`#${n} [game] unknown message '${msg.type}'`)
	}

	const clientMessage = async (msg) => {
		switch (msg.type) {
			case 'join':
				if (debugCommands) console.log(`#${n} [client] ${msg.type} ${JSON.stringify(msg.user)}`)
				peers.leave(client)
				peers.join(client, msg.user)
				return

			case 'leave':
				if (debugCommands) console.log(`#${n} [client] ${msg.type}`)
				peers.leave(client)
				return

			case 'settings':
				if (debugCommands) console.log(`#${n} [client] ${msg.type} ${msg.key} => ${JSON.stringify(msg.val)}`)
				await storage.set(user, msg.key, msg.val)
				if (msg.key == 'info') {
					client.info = tools.merge(client.info, msg.val)
					if (client.server) {
						if (!client.info.online) peers.disconnectViewers(client)
						peers.streamerChange(client)
					}
				}
				return

			case 'assign':
				if (debugCommands) console.log(`#${n} [client] ${msg.type} ${msg.colonistID} ${JSON.stringify(msg.viewer)}`)
				peers.assign(client, msg.colonistID, msg.viewer)
				return

			case 'state':
				if (debugCommands) console.log(`#${n} [client] ${msg.type} ${msg.key} ${JSON.stringify(msg.val)}`)
				peers.setGameState(client, msg.key, msg.val)
				return

			case 'job':
				if (debugCommands) console.log(`#${n} [client] ${msg.type} ${msg.id} ${msg.method} ${JSON.stringify(msg.args)}`)
				peers.runJob(client, msg.id, msg.method, msg.args)
				return
		}
		console.log(`#${n} [client] unknown message '${msg.type}'`)
	}

	ws.on('message', async (e) => {
		msg = parse(e)
		if (msg.type == 'ping') return
		user.game ? gameMessage(msg) : clientMessage(msg)
	})

	ws.on('close', () => {
		if (debugCommands) console.log(`#${n} closed`)
		user.game ? peers.removeGame(ws) : peers.removeClient(ws)
	})
}

module.exports = connect
