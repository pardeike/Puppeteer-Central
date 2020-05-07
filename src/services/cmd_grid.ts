import { createStateLink } from '@hookstate/core'
import tools from '../tools'

var ws = undefined
const initialRadius = 4

const gridFrame = {
	x1: -1,
	z1: -1,
	x2: -1,
	z2: -1,
}
const frameRef = createStateLink(gridFrame)

let mapUpdatedCallback = undefined

const initialValue = {
	px: 0,
	pz: 0,
	phx: 0.0,
	phz: 0.0,
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
		let f = frameRef.access().get()
		if (Math.max(f.x1, f.z1, f.x2, f.z2) == -1) {
			const px = msg.info.px
			const pz = msg.info.pz
			frameRef.access().set({
				x1: px - initialRadius,
				z1: pz - initialRadius,
				x2: px + initialRadius,
				z2: pz + initialRadius,
			})
		}
		if (mapUpdatedCallback) mapUpdatedCallback(url)
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
	frameRef,
	link,
	msg,
	remove,
	reset,
	//
	setMapUpdateCallback,
	draftTo,
}
