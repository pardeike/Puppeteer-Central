import { createStateLink } from '@hookstate/core'

const initialValue = {
	version: '',
	mapFreq: 0,
}
const ref = createStateLink(initialValue)

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'game-info') {
		ref.access().set(msg.info)
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
