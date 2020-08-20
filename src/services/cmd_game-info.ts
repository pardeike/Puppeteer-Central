import { createStateLink } from '@hookstate/core'
import tools from '../tools'

var ws = undefined

const initialValue = {
	version: '',
	mapFreq: 0,
	hairStyles: [],
	bodyTypes: [],
	features: [],
	style: {
		gender: '',
		hairStyle: '',
		bodyType: '',
		melanin: 0,
		hairColor: [0, 0, 0],
	},
	tt_commands: [],
}
const ref = createStateLink(initialValue)

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'game-info') {
		ref.access().set(msg.info)
	}
	if (msg.type == 'toolkit-commands') {
		ref.access().nested.tt_commands.set(msg.commands)
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

const customize = (key, val) => {
	tools.send(ws, 'customize', { key, val })
}

export default {
	ref,
	link,
	msg,
	remove,
	reset,
	//
	customize,
}
