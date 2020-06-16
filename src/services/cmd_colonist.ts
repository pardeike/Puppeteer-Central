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
	childhood: [],
	adulthood: [],
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
	incapable: [],
	traits: [],
}
const ref = createStateLink(initialValue)
const flagsRef = createStateLink(initialFlags)
const isDraftedRef = createStateLink(false)
const isAvailableRef = createStateLink(false)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'colonist-available') {
		isAvailableRef.access().set(msg.state)
	}
	if (msg.type == 'colonist-basics') {
		ref.access().set(msg.info)
		if (msg.info.drafted != isDraftedRef.access().get()) {
			isDraftedRef.access().set(msg.info.drafted)
		}
		const flags = flagsRef.access().nested
		isAvailableRef.access().set(msg.info.name > '')
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
	isDraftedRef,
	isAvailableRef,
	link,
	msg,
	remove,
	reset,
}
