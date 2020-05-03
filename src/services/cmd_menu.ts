import { createStateLink } from '@hookstate/core'

const initialValue = []
const ref = createStateLink(initialValue)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'menu') {
		ref.access().set(msg.choices)
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
