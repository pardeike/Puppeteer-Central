import { createStateLink } from '@hookstate/core'
import tools from '../tools'

const initialValue = {
	frame: [
		{ x: -1, z: -1 },
		{ x: -1, z: -1 },
		{ x: -1, z: -1 },
		{ x: -1, z: -1 },
	],
	gizmos: [],
	atlasURL: '',
}

const ref = createStateLink(initialValue)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'selection') {
		msg.atlasURL = tools.dataURL(msg.atlas)
		ref.access().set(msg)
	}
}

const remove = (_e) => {}

const reset = () => {
	ref.access().set(initialValue)
}

export default {
	initialValue,
	ref,
	link,
	msg,
	remove,
	reset,
}
