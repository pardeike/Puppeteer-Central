import { createStateLink } from '@hookstate/core'
import tools from '../tools'

var ws = undefined
var gridScale = 12

const initialValue = {
	px: 0,
	pz: 0,
	val: [],
}
const ref = createStateLink(initialValue)
const scaleRef = createStateLink(gridScale)

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'grid') {
		ref.access().set(msg.info)
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

const draftTo = (x, z) => {
	tools.send(ws, 'draft-to', { x, z })
}

export default {
	ref,
	scaleRef,
	link,
	msg,
	remove,
	reset,
	//
	draftTo,
}
