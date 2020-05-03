import { createStateLink } from '@hookstate/core'
import tools from '../tools'
import commands from '../commands'

var ws = undefined
const initialRadius = 4

const gridFrame = {
	x1: -1,
	z1: -1,
	x2: -1,
	z2: -1,
	inited: false,
}
const frameRef = createStateLink(gridFrame)
const mapDataURLRef = createStateLink('')

const initialValue = {
	px: 0,
	pz: 0,
	phx: 0.0,
	phz: 0.0,
	counter: 0,
}
const ref = createStateLink(initialValue)

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'grid') {
		msg.info.counter = ref.access().nested.counter.value + 1
		mapDataURLRef.access().set(tools.dataURL(msg.info.map))
		msg.info.map = undefined
		ref.access().set(msg.info)
		const px = msg.info.px
		const pz = msg.info.pz
		let f = frameRef.access().get()
		if (f.inited == false) {
			f = {
				x1: px - initialRadius,
				z1: pz - initialRadius,
				x2: px + initialRadius,
				z2: pz + initialRadius,
				inited: true,
			}
			frameRef.access().set(f)
			commands.setGridPosition(f)
		}
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

const draftTo = (x, z) => {
	tools.send(ws, 'draft-to', { x, z })
}

export default {
	ref,
	mapDataURLRef,
	frameRef,
	link,
	msg,
	remove,
	reset,
	//
	draftTo,
}
