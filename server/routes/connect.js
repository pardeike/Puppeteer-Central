const peers = require('../services/peers')
const storage = require('../services/storage')
const tools = require('../services/tools')
const { encode, parse } = require('../services/bson')

const minimumModVersion = '0.2.0.0'

// https://blog.stephencleary.com/2009/04/tcpip-net-sockets-faq.html

var counter = 0
var debugMainCommands = false
var debugCommonCommands = false

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
	if (debugMainCommands) console.log(`NEW GAME #${n} ${user.service}:${user.id}:${user.game}`)
	var client = peers.findClient(user)
	if (!client) {
		if (debugMainCommands) console.log(`#${n} adding default viewer`)
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
	if (debugMainCommands) console.log(`#${n} adding game`)
	peers.addGame(client, ws)
	ws.sendEncoded({ type: 'welcome', minVersion: minimumModVersion })
	return client
}

async function helloViewer(n, user, ws) {
	if (debugMainCommands) console.log(`NEW VIEWER #${n} ${user.service}:${user.id}:${user.name}:${user.picture ? 'pic' : 'nopic'}`)
	let settings = await storage.read(user)
	if (!settings || !settings.info) settings = defaultSettings
	if (debugCommonCommands) console.log(`#${n} settings: ${JSON.stringify(settings)}`)
	const info = settings.info
	if (debugMainCommands) console.log(`#${n} adding viewer ${user.service}:${user.id}:${user.name}:${user.picture ? 'pic' : 'nopic'}`)
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
	const streamers = await peers.availableStreamers()
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
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type} ${JSON.stringify(msg.colonists)}`)
				peers.colonists(client, msg.colonists)
				return

			case 'assignment':
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type} ${msg.viewer.service}:${msg.viewer.id} ${msg.state}`)
				peers.assignment(client, msg.viewer, msg.state)
				return

			case 'game-info':
			case 'time-info':
			case 'earn':
			case 'portrait':
			case 'colonist-basics':
				// if (debugCommonCommands) console.log(`#${n} [game] ${msg.type} ${msg.info}`)
				peers.gameMessage(msg.type, msg.viewer, msg.info)
				return

			case 'colonist-available':
				peers.availability(client, msg.viewer, msg.state)
				return

			case 'state':
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type} ${msg.key} ${JSON.stringify(msg.val)}`)
				peers.setClientState(client, msg.viewer, msg.key, msg.val)
				return

			case 'job':
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type} ${msg.id} ${msg.info}`)
				peers.returnJobResult(client, msg.viewer, msg.id, msg.info)
				return

			case 'grid':
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type}`)
				peers.grid(client, msg.controller, msg.info)
				return

			case 'menu':
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type}`)
				peers.menu(client, msg.controller, msg.choices)
				return

			case 'selection':
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type}`)
				peers.selection(client, msg.controller, msg.frame, msg.gizmos, msg.atlas)
				return

			case 'chat':
				if (debugCommonCommands) console.log(`#${n} [game] ${msg.type}`)
				peers.outgoingChat(client, msg.viewer, msg.message)
				return
		}
		console.log(`#${n} [game] unknown message '${msg.type}'`)
	}

	const clientMessage = async (msg) => {
		switch (msg.type) {
			case 'join':
				if (debugCommonCommands) console.log(`#${n} [client] ${msg.type} ${JSON.stringify(msg.user)}`)
				peers.leave(client)
				peers.join(client, msg.user)
				return

			case 'leave':
				if (debugCommonCommands) console.log(`#${n} [client] ${msg.type}`)
				peers.leave(client)
				return

			case 'settings':
				if (debugCommonCommands) console.log(`#${n} [client] ${msg.type} ${msg.key} => ${JSON.stringify(msg.val)}`)
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
				if (debugCommonCommands) console.log(`#${n} [client] ${msg.type} ${msg.colonistID} ${JSON.stringify(msg.viewer)}`)
				peers.assign(client, msg.colonistID, msg.viewer)
				return

			case 'state':
				if (debugCommonCommands) console.log(`#${n} [client] ${msg.type} ${msg.key} ${JSON.stringify(msg.val)}`)
				peers.setGameState(client, msg.key, msg.val)
				return

			case 'job':
				if (debugCommonCommands) console.log(`#${n} [client] ${msg.type} ${msg.id} ${msg.method} ${JSON.stringify(msg.args)}`)
				peers.runJob(client, msg.id, msg.method, msg.args)
				return

			case 'chat':
				if (debugCommonCommands) console.log(`#${n} [client] ${msg.type} ${msg.message}`)
				peers.incomingChat(client, msg.message)
				return
		}
		console.log(`#${n} [client] unknown message '${msg.type}'`)
	}

	ws.on('message', async (e) => {
		try {
			const msg = parse(e)
			if (!msg) {
				console.log(`#${n} invalid bson message`)
				return
			}
			if (msg.type == 'ping') return
			user.game ? gameMessage(msg) : clientMessage(msg)
		} catch (err) {
			console.log(`#${n} message error: ${err}`)
		}
	})

	ws.on('close', () => {
		if (debugMainCommands) console.log(`#${n} closed`)
		user.game ? peers.removeGame(ws) : peers.removeClient(ws)
	})
}

module.exports = connect
