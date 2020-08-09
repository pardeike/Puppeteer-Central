const tools = require('./tools')
const twitch = require('./twitch')
const { encode } = require('./bson')

const peersDebugging = false

const methodError = (method, err) => {
	console.log(`!!!! ${method.toUpperCase()} ERROR: ${err}`)
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

const debugClients = (context, currentClient) => {
	if (!peersDebugging) return
	console.log('')
	console.log(`${context}, ${clients.length} clients total:`)
	clients.forEach((c, i) => {
		console.log(`${i}: ${c.user.name}:${c.user.service}:${c.user.id} ${c == currentClient ? 'CURRENT' : ''}`)
		console.log(`   |- info=${tools.debugValue(c.info)}`)
		console.log(`   |- srvr=${c.server != undefined}`)
		console.log(`   |- game=${c.game.connected} [${c.game.colonists.length}]`)
		console.log(`   |- sockets=#${c.sockets.length}`)
		console.log(`   |- stalled=${c.stalled ? 'yes' : 'no'}`)
		console.log(`   +- viewers=[${c.viewers.map((v) => (v ? v.user.id : 'NULL')).join(',')}]`)
		c.viewers.forEach((v, j) => {
			console.log(`      ${j}: ${v ? v.user.name + ':' + v.user.service + ':' + v.user.id : 'NULL'} ${v == currentClient ? 'CURRENT' : ''}`)
			console.log(`         +- ${v.viewers.length} viewer(s)`)
		})
	})
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
	// if (msg.type != 'earn' && msg.type != 'colonist-basics') debugClients(`Sending client message ${msg.type}`, client)
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
					if (streamer && streamer.server) safeServerSend({ type: 'stalling', viewer: publicUser(user), state: user.stalled })(streamer.server)
				}
			} else {
				if (!user) console.log('safeClientSend called with undefined user')
				if (!s) console.log('safeClientSend called with undefined socket')
			}
			if (!skipable || s.bufferedAmount == 0) s.send(encode(msg))
		} catch (err) {
			if (`${err}`.indexOf('(CLOSED)') == -1) console.log(`SafeClientSend error: ${err}`)
		}
		n++
	})
}

const safeServerSend = (msg, skipable) => (s) => {
	// debugClients(`Sending server message ${msg.type}`, undefined)
	if (!s) {
		console.log('safeServerSend called with undefined socket')
		return
	}
	if (peersDebugging) console.log(`SENDING ${msg.type} FROM ${msg.viewer.name}:${msg.viewer.service}:${msg.viewer.id}`)
	try {
		if (!skipable || s.bufferedAmount == 0) s.send(encode(msg))
	} catch (err) {
		if (`${err}`.indexOf('(CLOSED)') == -1) methodError('safeServerSend', err)
	}
}

function addClient(type, user, info) {
	try {
		var client = findClient(user)
		console.log(`### ${type} ${client ? 'MERGED' : 'ADDED'}: user=${tools.debugValue(user)}`)
		if (client) {
			client.user = user // refresh picture for example
			client.sockets.push(info.ws)
			debugClients('Adding existing client', client)
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
		debugClients('Adding new client', client)
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
		const serverSend = safeServerSend(msg)
		client.viewers.forEach((c) => c.sockets.filter((s) => client.sockets.indexOf(s) == -1).forEach(serverSend))
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
		debugClients('Removing client', client)
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
		const serverSend = safeServerSend(msg)
		client.viewers.forEach((c) => c.sockets.filter((s) => client.sockets.indexOf(s) == -1).forEach(serverSend))
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
		safeServerSend({ type: 'assign', colonistID, viewer })(client.server)
	} catch (err) {
		methodError('assign', err)
	}
}

function disconnectViewers(client) {
	try {
		if (serverAvailable(client)) client.viewers.forEach((c) => safeServerSend({ type: 'leave', viewer: publicUser(c.user) })(client.server))
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
			safeServerSend({ type: 'join', viewer: publicUser(client.user) })(streamer.server)
			return
		}
		if (!serverAvailable(streamer)) return
		streamer.viewers.push(client)
		debugClients('Join', client)
		streamerChange(streamer)
		safeServerSend({ type: 'join', viewer: publicUser(client.user) })(streamer.server)
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
					safeServerSend({ type: 'leave', viewer: publicUser(client.user) })(streamer.server)
				}
			})
		debugClients('Leave', client)
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

async function availableStreamers() {
	try {
		let streamers = clients.filter(serverAvailable).map((c) => publicClient(c))
		var ids = streamers.map((streamer) => streamer.user.id)
		var infos = await twitch.streamInfo(ids)
		streamers.forEach((streamer) => {
			streamer.stream = infos.find((info) => info.id == streamer.user.id).info
		})
		// sort((a, b) => (a.puppets == b.puppets ? a.colonists > b.colonists : a.puppets > b.puppets))
		return streamers.sort((a, b) => (a.stream ? a.stream.count : 0) > (b.stream ? b.stream.count : 0))
	} catch (err) {
		methodError('availableStreamers', err)
	}
}

async function streamerChange(client) {
	try {
		let streamer = publicClient(client)
		var infos = await twitch.streamInfo([streamer.user.id])
		streamer.stream = infos[0].info
		const json = { type: 'streamer', streamer }
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
				if (streamer.server) safeServerSend({ type: 'state', user: userId(client.user), key, val })(streamer.server)
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
				if (streamer.server) safeServerSend({ type: 'job', user: userId(client.user), id, method, args })(streamer.server)
			})
	} catch (err) {
		methodError('runJob', err)
	}
}

function incomingChat(client, message) {
	try {
		debugClients('Chat', client)
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				if (streamer.server) safeServerSend({ type: 'chat', viewer: userId(client.user), message })(streamer.server)
			})
	} catch (err) {
		methodError('incomingChat', err)
	}
}

function customize(client, key, val) {
	try {
		debugClients('Customize', client)
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				if (streamer.server) safeServerSend({ type: 'customize', viewer: userId(client.user), key, val })(streamer.server)
			})
	} catch (err) {
		methodError('customize', err)
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
	getViewers,
	assign,
	disconnectViewers,
	join,
	leave,
	gameMessage,
	colonists,
	assignment,
	availability,
	availableStreamers,
	streamerChange,
	setClientState,
	setGameState,
	runJob,
	incomingChat,
	customize,
	returnJobResult,
	grid,
	menu,
	selection,
	outgoingChat,
}
