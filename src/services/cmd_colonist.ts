import { createStateLink } from '@hookstate/core'

const initialValue = {
	name: '',
	x: 0,
	y: 0,
	mx: 0,
	my: 0,
	inspect: [],
	health: { label: '', percent: 0 },
	mood: { label: '', percent: 0 },
	restrict: { label: '', r: 0, g: 0, b: 0 },
	area: { label: '', r: 0, g: 0, b: 0 },
	drafted: false,
	response: '',
	needs: [],
	treshholds: [],
	thoughts: [],
	capacities: [],
	injuries: [],
}
const ref = createStateLink(initialValue)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'colonist-basics') {
		ref.access().set(msg.info)
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

export default {
	initialValue,
	ref,
	link,
	msg,
	remove,
	reset,
}
