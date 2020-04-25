const tools = require('./tools')
const { encode } = require('./bson')

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
	viewers: c.viewers.length,
})

const safeClientSend = (client, msg, skipable) => {
	let n = 1
	const user = client.user
	const wasStalled = user ? user.stalled : false
	client.sockets.forEach((s) => {
		try {
			if (user) {
				user.stalled = s.bufferedAmount > 0
				if (wasStalled != user.stalled) {
					const state = user.stalled ? 'stalled' : 'stopped stalling'
					console.log(`Socket ${n} for ${user.name}:${user.service} ${state}`)
					var streamer = findClient(user)
					if (streamer) safeSend({ type: 'stalling', viewer: publicUser(user), state })(streamer.server)
				}
			}
			if (!skipable || s.bufferedAmount == 0) s.send(encode(msg))
		} catch (err) {
			if (`${err}`.indexOf('(CLOSED)') == -1) console.log(`Send error: ${err}`)
		}
		n++
	})
}

const safeSend = (msg, skipable) => (s) => {
	try {
		if (!skipable || s.bufferedAmount == 0) s.send(encode(msg))
	} catch (err) {
		if (`${err}`.indexOf('(CLOSED)') == -1) console.log(`Send error: ${err}`)
	}
}

function addClient(type, user, info) {
	try {
		var client = findClient(user)
		console.log(`### ${type} ${client ? 'MERGED' : 'ADDED'}: user=${JSON.stringify(user)}`)
		if (client) {
			client.user = user // refresh picture for example
			client.sockets.push(info.ws)
			return client
		}
		console.log('### CLIENTS:')
		clients.forEach((c) => {
			const us = clients.map((c) => c.user)
			console.log(`### ${JSON.stringify(us)}`)
		})
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
		return client
	} catch (err) {
		console.log(`### addClient error: ${err}`)
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
		console.log(`### addGame error: ${err}`)
	}
}

function removeClient(ws) {
	try {
		const client = clients.find((c) => c.sockets.indexOf(ws) >= 0)
		if (!client) return
		leave(client)
		tools.remove(client.sockets, (s) => s == ws)
	} catch (err) {
		console.log(`### removeClient error: ${err}`)
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
		console.log(`### removeGame error: ${err}`)
	}
}

function findClient(user) {
	try {
		return clients.find((c) => sameUser(c.user, user))
	} catch (err) {
		console.log(`### findClient error: ${err}`)
	}
}

function availableStreamers() {
	try {
		return clients
			.filter(serverAvailable)
			.map((c) => publicClient(c))
			.sort((a, b) => a.viewers > b.viewers)
	} catch (err) {
		console.log(`### availableStreamers error: ${err}`)
	}
}

function getViewers(user, search) {
	try {
		var streamer = findClient(user)
		if (!streamer) return []
		if (!serverAvailable(streamer)) return []
		return streamer.viewers.filter((c) => !search || c.user.name.indexOf(search) != -1).map((c) => publicUser(c.user))
	} catch (err) {
		console.log(`### getViewers error: ${err}`)
	}
}

function assign(client, colonistID, viewer) {
	try {
		if (!serverAvailable(client)) return
		safeSend({ type: 'assign', colonistID, viewer })(client.server)
	} catch (err) {
		console.log(`### assign error: ${err}`)
	}
}

function disconnectViewers(client) {
	try {
		client.viewers.forEach((c) => safeSend({ type: 'leave', viewer: publicUser(c.user) })(client.server))
		client.viewers = []
	} catch (err) {
		console.log(`### disconnectViewers error: ${err}`)
	}
}

function join(client, user) {
	try {
		var streamer = findClient(user)
		if (!streamer) return
		if (streamer.viewers.indexOf(client) != -1) {
			safeSend({ type: 'join', viewer: publicUser(client.user) })(streamer.server)
			return
		}
		if (!serverAvailable(streamer)) return
		streamer.viewers.push(client)
		streamerChange(streamer)
		safeSend({ type: 'join', viewer: publicUser(client.user) })(streamer.server)
	} catch (err) {
		console.log(`### join error: ${err}`)
	}
}

function leave(client) {
	try {
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				tools.remove(streamer.viewers, (c) => c == client)
				if (streamer.server) {
					streamerChange(streamer)
					safeSend({ type: 'leave', viewer: publicUser(client.user) })(streamer.server)
				}
			})
	} catch (err) {
		console.log(`### leave error: ${err}`)
	}
}

function gameMessage(type, user, info) {
	try {
		var client = findClient(user)
		if (client) safeClientSend(client, { type, info }, true)
	} catch (err) {
		console.log(`### gameMessage ${type} error: ${err}`)
	}
}

function colonists(client, colonists) {
	try {
		if (!serverAvailable(client)) return
		client.game.colonists = colonists
		safeClientSend(client, { type: 'colonists', colonists }, true)
	} catch (err) {
		console.log(`### colonists error: ${err}`)
	}
}

function assignment(client, viewer, state) {
	try {
		const json = { type: 'assignment', state }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json))
	} catch (err) {
		console.log(`### assignment error: ${err}`)
	}
}

function streamerChange(client) {
	try {
		const json = { type: 'streamer', streamer: publicClient(client) }
		clients.forEach((c) => safeClientSend(c, json, true))
	} catch (err) {
		console.log(`### streamerChange error: ${err}`)
	}
}

function setClientState(client, viewer, key, val) {
	try {
		const json = { type: 'state', key, val }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json))
	} catch (err) {
		console.log(`### setClientState error: ${err}`)
	}
}

function setGameState(client, key, val) {
	try {
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				safeSend({ type: 'state', user: userId(client.user), key, val })(streamer.server)
			})
	} catch (err) {
		console.log(`### setGameState error: ${err}`)
	}
}

function runJob(client, id, method, args) {
	try {
		clients
			.filter((c) => c.viewers.indexOf(client) != -1)
			.forEach((streamer) => {
				safeSend({ type: 'job', user: userId(client.user), id, method, args })(streamer.server)
			})
	} catch (err) {
		console.log(`### runJob error: ${err}`)
	}
}

function returnJobResult(client, viewer, id, info) {
	try {
		const json = { type: 'job', id, info: JSON.parse(info) }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json))
	} catch (err) {
		console.log(`### returnJobResult error: ${err}`)
	}
}

function grid(client, viewer, info) {
	try {
		const json = { type: 'grid', info }
		client.viewers.filter((c) => sameUser(c.user, viewer)).forEach((c) => safeClientSend(c, json, true))
	} catch (err) {
		console.log(`### grid error: ${err}`)
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
	streamerChange,
	setClientState,
	setGameState,
	runJob,
	returnJobResult,
	grid,
}
