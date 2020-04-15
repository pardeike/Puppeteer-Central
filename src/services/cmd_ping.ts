import { createStateLink } from '@hookstate/core'
import tools from '../tools'

const initialValue = {}
const ref = createStateLink(initialValue)

var ping = undefined

const link = (ws) => {
	ping = setInterval(() => {
		tools.send(ws, 'ping', { game: false })
	}, 10000)
}

const msg = (_msg) => {}

const remove = (_e) => {
	clearInterval(ping)
}

const reset = () => ref.access().set(initialValue)

export default {
	ref,
	link,
	msg,
	remove,
	reset,
}
