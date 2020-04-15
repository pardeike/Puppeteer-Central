import { createStateLink } from '@hookstate/core'
import tools from '../tools'

var ws = undefined

const initialValue = {
	user: {
		service: '',
		id: 0,
		name: '',
		picture: '',
		game: '',
		version: 0,
		iat: 0,
		exp: 0,
	},
	game: {
		connected: false,
		colonists: [],
	},
	viewers: 0,
}
const ref = createStateLink(initialValue)

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'status') {
		ref.access().set(msg.status)
	}
	if (msg.type == 'game') {
		ref.access().nested.game.nested.connected.set(msg.event == 'connect')
	}
	if (msg.type == 'colonists') {
		ref.access().nested.game.nested.colonists.set(msg.colonists)
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

const assign = (colonistID, viewer) => {
	tools.send(ws, 'assign', { colonistID, viewer })
}

export default {
	ref,
	link,
	msg,
	remove,
	reset,
	//
	assign,
}
