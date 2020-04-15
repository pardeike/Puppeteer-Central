import { createStateLink } from '@hookstate/core'

const initialValue = {
	zones: [],
	priorities: {},
	schedules: {},
}
const ref = createStateLink(initialValue)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'state') {
		ref.access().get()[msg.key] = msg.val
	}
}

const remove = (_e) => {}

const reset = () => ref.access().set(initialValue)

export default {
	ref,
	link,
	msg,
	remove,
	reset,
}
