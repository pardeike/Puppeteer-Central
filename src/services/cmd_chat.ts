import { createStateLink } from '@hookstate/core'
import tools from '../tools'

var ws = undefined

const initialValue = []
const ref = createStateLink(initialValue)
let lastMessage = 'bal'

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'chat') {
		let msgs = ref.access().get()
		msgs.splice(0, 0, { message: lastMessage, result: msg.message })
		msgs.length = Math.min(msgs.length, 4)
		ref.access().set(msgs)
		lastMessage = ''
	}
}

const remove = (_e) => {}

const reset = () => {
	ref.access().set(initialValue)
}

const send = (message) => {
	lastMessage = message
	tools.send(ws, 'chat', { message })
}

export default {
	initialValue,
	ref,
	link,
	msg,
	remove,
	reset,
	//
	send,
}
