import { createStateLink } from '@hookstate/core'
import tools from '../tools'

var ws = undefined
let mapUpdatedCallback = undefined

const initialValue = {
	px: 0,
	pz: 0,
	phx: 0.0,
	phz: 0.0,
	frame: {
		x1: -1,
		z1: -1,
		x2: -1,
		z2: -1,
	},
}
const ref = createStateLink(initialValue)

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'grid') {
		const url = tools.dataURL(msg.info.map)
		msg.info.map = undefined
		ref.access().set(msg.info)
		if (mapUpdatedCallback) mapUpdatedCallback(url, msg.info.frame)
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

const setMapUpdateCallback = (cb) => {
	mapUpdatedCallback = cb
}

const draftTo = (x, z) => {
	tools.send(ws, 'draft-to', { x, z })
}

export default {
	ref,
	link,
	msg,
	remove,
	reset,
	//
	setMapUpdateCallback,
	draftTo,
}
