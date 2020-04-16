import { createStateLink } from '@hookstate/core'

const initialFlags = {
	assigned: false,
	thoughts: false,
	capacities: false,
	injuries: false,
	skills: false,
}
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
	bleedingRate: 0,
	deathIn: 0,
	injuries: [],
	skills: [],
}
const ref = createStateLink(initialValue)
const flagsRef = createStateLink(initialFlags)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'colonist-basics') {
		ref.access().set(msg.info)

		const flags = flagsRef.access().nested
		if (flags.assigned.value != msg.info.name > '') {
			flags.assigned.set(msg.info.name > '')
		}
		;['thoughts', 'capacities', 'injuries', 'skills'].forEach((el) => {
			if (flags[el].value != msg.info[el].length > 0) flags[el].set(msg.info[el].length > 0)
		})
	}
}

const remove = (_e) => {}

const reset = () => {
	ref.access().set(initialValue)
	flagsRef.access().set(initialFlags)
}

export default {
	initialValue,
	ref,
	flagsRef,
	link,
	msg,
	remove,
	reset,
}
