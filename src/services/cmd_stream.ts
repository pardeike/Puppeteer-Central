import { createStateLink } from '@hookstate/core'
import tools from '../tools'

var ws = undefined

const initialValue = {
	connected: false,
	lastMessage: undefined,
	messageCount: 0,
	gameJoined: false,
}
const ref = createStateLink(initialValue)

const link = (_ws) => {
	ws = _ws
	ref.access().nested.connected.set(true)
	ref.access().nested.lastMessage.set(Date.now())
}

const msg = (_msg) => {
	ref.access().nested.messageCount.set(ref.access().nested.messageCount.value + 1)
	ref.access().nested.lastMessage.set(Date.now())
}

const remove = (e) => {
	// see https://tools.ietf.org/html/rfc6455
	//const abnormalClose = e.code == 1006
	//console.log(`${abnormalClose ? 'unreachable' : 'disconnected'}`)
	ref.access().nested.connected.set(false)
}

const reset = () => ref.access().set(initialValue)

const join = (user) => {
	tools.send(ws, 'join', { user: { id: user.id, service: user.service } })
	ref.access().nested.gameJoined.set(true)
}

const leave = () => {
	reset()
	tools.send(ws, 'leave', {})
}

const state = (key, val) => {
	tools.send(ws, 'state', { key, val })
}

export default {
	ref,
	link,
	msg,
	remove,
	reset,
	//
	join,
	leave,
	state,
}
