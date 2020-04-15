import { createStateLink } from '@hookstate/core'
import settings from '../services/cmd_settings'
import commands from '../commands'

var ws = undefined

const initialValue = -1
const ref = createStateLink(initialValue)

const link = (_ws) => (ws = _ws)

const msg = (msg) => {
	if (msg.type == 'assignment') {
		const user = settings.ref.access().nested.viewing.get()
		msg.state ? commands.joinGame(user) : commands.leaveGame(false)
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

export default {
	ref,
	link,
	msg,
	remove,
	reset,
}
