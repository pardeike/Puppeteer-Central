import { createStateLink } from '@hookstate/core'
import stream from '../services/cmd_stream'
import tools from '../tools'

var ws = undefined

const initialValue = {
	game: '',
	info: {
		online: false,
		title: '',
		matureOnly: false,
	},
	viewing: {
		id: undefined,
		service: undefined,
	},
}
const ref = createStateLink(initialValue)
const settings = ref.access()

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'settings') {
		settings.set(msg.settings || initialValue)
		const viewing = msg.settings.viewing
		if (viewing && viewing.id) {
			stream.join(viewing)
		}
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

const update = (key, val) => {
	const data = settings.get()
	data[key] = val
	settings.set(data)
	tools.send(ws, 'settings', { key, val })
}

export default {
	ref,
	link,
	msg,
	remove,
	reset,
	//
	update,
}
