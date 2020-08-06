const tools = require('./tools')
const { encode } = require('./bson')

const peersDebugging = false

const methodError = (method, err) => {
	console.log(`### ${method} error: ${err}`)
}

/*
[{
	info: {
		started: Ticks,
		online: false,
		title: '',
		matureOnly: false
	},
	user: {
		id: 0,
		name: '',
		service: 'youtube,twitch',
		picture: ''
	},
	server: ws/undefined,
	game: {
		connected: false,
		colonists: []
	},
	viewers: [client],
	sockets: [ws],
	stalled: false
}]
*/

const clients = []

const _debug = (c, i, indent, currentClient) => {
	const s0 = '      '.repeat(indent - 1)
	const s1 = '      '.repeat(indent)
	console.log(`${s0}--> ${i}: ${c.user.name}:${c.user.service}:${c.user.id} ${c == currentClient ? 'CURRENT' : ''}`)
	console.log(`${s1} |- info=${JSON.stringify(c.info)}`)
	console.log(`${s1} |- srvr=${c.server != undefined}`)
	console.log(`${s1} |- game=${c.game.connected} [${c.game.colonists.length}]`)
	console.log(`${s1} |- sockets=${c.sockets.length}`)
	console.log(`${s1} |- stalled=${c.stalled ? 'yes' : 'no'}`)
	console.log(`${s1} +- ${c.viewers.length} viewer(s)`)
	c.viewers.forEach((v, j) => _debug(v, j, indent + 1, currentClient))
}

const debugClients = (currentClient) => {
	if (!peersDebugging) return
	console.log(`TOTAL ${clients.length} CLIENTS:`)
	clients.forEach((c, i) => _debug(c, i, 1, currentClient))
}

const sameUser = (u1, u2) => u1.service == u2.service && u1.id == u2.id
const serverAvailable = (c) => c && c.server && c.info.online
const publicInfo = (c) => ({
	started: c.info.started,
	online: serverAvailable(c),
	title: c.info.title,
	matureOnly: c.info.matureOnly,
})
const userId = (u) => ({
	id: u.id,
	name: u.name,
	service: u.service,
})
const publicUser = (u) => ({
	id: u.id,
	name: u.name,
	service: u.service,
	picture: u.picture,
})
const publicClient = (c) => ({
	info: publicInfo(c),
	user: publicUser(c.user),
	colonists: c.game.colonists.length,
	puppets: c.viewers.length,
})

const safeClientSend = (client, msg, skipable) => {
	if (msg.type != 'earn' && msg.type != 'colonist-basics') debugClients(client)
	let n = 1
	const user = client.user
	const wasStalled = user ? user.stalled : false
	client.sockets.forEach((s) => {
		try {
			if (user && s) {
				user.stalled = s.bufferedAmount > 0
				if (wasStalled != user.stalled) {
					const state = user.stalled ? 'stalled' : 'stopped stalling'
					console.log(`Socket ${n} for ${user.name}:${user.service} ${state}`)
					var streamer = findClient(user)
					if (streamer && streamer.server) safeSend({ type: 'stalling', viewer: publicUser(user), state: user.stalled })(streamer.server)
				}
			} else {
				if (!user) console.log('safeClientSend called with undefined usser')
				if (!s) console.log('safeClientSend called with undefined socket')
			}
			if (!skipable || s.bufferedAmount == 0) s.send(encode(msg))
		} catch (err) {
			if (`${err}`.indexOf('(CLOSED)') == -1) console.log(`SafeClientSend error: ${err}`)
		}
		n++
	})
}

const safeSend = (msg, skipable) => (s) => {
	if (!s) {
		console.log('SafeSend called with undefined socket')
		return
	}
	if (peersDebugging) console.log(`SENDING ${msg.type} FROM ${msg.viewer.name}:${msg.viewer.service}:${msg.viewer.id}`)
	try {
		if (!skipable || s.bufferedAmount == 0) s.send(encode(msg))
	} catch (err) {
		if (`${err}`.indexOf('(CLOSED)') == -1) methodError('safeSend', err)
	}
}

function addClient(type, user, info) {
	try {
		var client = findClient(user)
		console.log(`### ${type} ${client ? 'MERGED' : 'ADDED'}: user=${JSON.stringify(user)}`)
		if (client) {
			client.user = user // refresh picture for example
			client.sockets.push(info.ws)
			debugClients(client)
			return client
		}
		client = {
			info: {
				started: 0,
				online: info.online,
				title: info.title,
				matureOnly: info.matureOnly,
			},
			user: user,
			server: undefined,
			game: {
				connected: false,
				colonists: [],
			},
			viewers: [],
			sockets: info.ws ? [info.ws] : [],
			stalled: false,
		}
		clients.push(client)
		debugClients(client)
		return client
	} catch (err) {
		methodError('addClient', err)
	}
}

function addGame(client, ws) {
	try {
		client.server = ws
		client.game.connected = true
		client.info.started = Date.now()
		streamerChange(client)
		const msg = { type: 'game', event: 'connect' }
		safeClientSend(client, msg)
		client.viewers.forEach((c) => c.sockets.filter((s) => client.sockets.indexOf(s) == -1).forEach(safeSend(msg)))
	} catch (err) {
		methodError('addGame', err)
	}
}

function removeClient(ws) {
	try {
		const client = clients.find((c) => c.sockets.indexOf(ws) >= 0)
		if (!client) return
		leave(client)
		tools.remove(client.sockets, (s) => s == ws)
		debugClients(client)
	} catch (err) {
		methodError('removeClient', err)
	}
}

function removeGame(ws) {
	try {
		const client = clients.find((c) => c.server == ws)
		if (!client) return
		const msg = { type: 'game', event: 'disconnect' }
		safeClientSend(client, msg)
		client.viewers.forEach((c) => c.sockets.filter((s) => client.sockets.indexOf(s) == -1).forEach(safeSend(msg)))
		client.viewers = []
		client.server = undefined
		client.game.connected = false
		streamerChange(client)
	} catch (err) {
		methodError('removeGame', err)
	}
}

function findClient(user) {
	try {
		return clients.find((c) => sameUser(c.user, user))
	} catch (err) {
		methodError('findClient', err)
	}
}

function availableStreamers() {
	try {
		return clients
			.filter(serverAvailable)
			.map((c) => publicClient(c))
			.sort((a, b) => (a.puppets == b.puppets ? a.colonists > b.colonists : a.puppets > b.puppets))
	} catch (err) {
		methodError('availableStreamers', err)
	}
}

function getViewers(user, search) {
	try {
		var streamer = findClient(user)
		if (!streamer) return []
		if (!serverAvailable(streamer)) return []
		return streamer.viewers.filter((c) => !search || c.user.name.indexOf(search) != -1).map((c) => publicUser(c.user))
	} catch (err) {
		methodError('getViewers', err)
	}
}

function assign(client, colonistID, viewer) {
	try {
		if (!serverAvailable(client)) return
		safeSend({ type: 'assign', colonistID, viewer })(client.server)
	} catch (err) {
		methodError('assign', err)
	}
}

function disconnectViewers(client) {
	try {
		if (serverAvailable(client)) client.viewers.forEach((c) => safeSend({ type: 'leave', viewer: publicUser(c.user) })(client.server))
		client.viewers = []
	} catch (err) {
		methodError('disconnectViewers', err)
	}
}

function join(client, user) {
	try {
		var streamer = findClient(user)
		if (!streamer) return
		if (!serverAvailable(streamer)) return
		if (streamer.viewers.indexOf(client) != -1) {
			safeSend({ type: 'join', viewer: publicUser(client.user) })(streamer.server)
			return
		}
		if (!serverAvailable(streamer)) return
		streamer.viewers.push(client)
		debugClients(client)
		streamerChange(streamer)
		safeSend({ type: 'join', viewer: publicUser(client.user) })(streamer.server)
	} catch (err) {
		methodError('join', err)
	}
}

function leave(client) {
	try {
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				tools.remove(streamer.viewers, (c) => c == client)
				if (serverAvailable(streamer)) {
					streamerChange(streamer)
					safeSend({ type: 'leave', viewer: publicUser(client.user) })(streamer.server)
				}
			})
		debugClients(client)
	} catch (err) {
		methodError('leave', err)
	}
}

function gameMessage(type, user, info) {
	try {
		var client = findClient(user)
		if (client) safeClientSend(client, { type, info }, true)
	} catch (err) {
		methodError('gameMessage', err)
	}
}

function colonists(client, colonists) {
	try {
		client.game.colonists = colonists
		safeClientSend(client, { type: 'colonists', colonists }, true)
	} catch (err) {
		methodError('colonists', err)
	}
}

function assignment(client, viewer, state) {
	try {
		const json = { type: 'assignment', state }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json))
	} catch (err) {
		methodError('assignment', err)
	}
}

function availability(client, viewer, state) {
	try {
		const json = { type: 'colonist-available', state }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json))
	} catch (err) {
		methodError('availability', err)
	}
}

function streamerChange(client) {
	try {
		const json = { type: 'streamer', streamer: publicClient(client) }
		clients.forEach((c) => safeClientSend(c, json, true))
	} catch (err) {
		methodError('streamerChange', err)
	}
}

function setClientState(client, viewer, key, val) {
	try {
		const json = { type: 'state', key, val }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json))
	} catch (err) {
		methodError('setClientState', err)
	}
}

function setGameState(client, key, val) {
	try {
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				if (streamer.server) safeSend({ type: 'state', user: userId(client.user), key, val })(streamer.server)
			})
	} catch (err) {
		methodError('setGameState', err)
	}
}

function runJob(client, id, method, args) {
	try {
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				if (streamer.server) safeSend({ type: 'job', user: userId(client.user), id, method, args })(streamer.server)
			})
	} catch (err) {
		methodError('runJob', err)
	}
}

function incomingChat(client, message) {
	try {
		debugClients(client)
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				if (streamer.server) safeSend({ type: 'chat', viewer: userId(client.user), message })(streamer.server)
			})
	} catch (err) {
		methodError('incomingChat', err)
	}
}

function returnJobResult(client, viewer, id, info) {
	try {
		const json = { type: 'job', id, info: JSON.parse(info) }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json))
	} catch (err) {
		methodError('returnJobResult', err)
	}
}

function grid(client, viewer, info) {
	try {
		const json = { type: 'grid', info }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json, true))
	} catch (err) {
		methodError('grid', err)
	}
}

function menu(client, viewer, choices) {
	try {
		const json = { type: 'menu', choices }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json, true))
	} catch (err) {
		methodError('menu', err)
	}
}

function selection(client, viewer, frame, gizmos, atlas) {
	try {
		const json = { type: 'selection', frame, gizmos, atlas }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json, true))
	} catch (err) {
		methodError('selection', err)
	}
}

function outgoingChat(client, viewer, message) {
	try {
		const json = { type: 'chat', message }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json, true))
	} catch (err) {
		methodError('outgoingChat', err)
	}
}

module.exports = {
	addClient,
	addGame,
	removeClient,
	removeGame,
	findClient,
	availableStreamers,
	getViewers,
	assign,
	disconnectViewers,
	join,
	leave,
	gameMessage,
	colonists,
	assignment,
	availability,
	streamerChange,
	setClientState,
	setGameState,
	runJob,
	incomingChat,
	returnJobResult,
	grid,
	menu,
	selection,
	outgoingChat,
}
