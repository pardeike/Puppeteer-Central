import { createStateLink } from '@hookstate/core'

const initialValue = -1
const ref = createStateLink(initialValue)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'earn') {
		ref.access().set(msg.info.amount)
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
