import { createStateLink } from '@hookstate/core'

const initialValue = {
	parts: []
}
const ref = createStateLink(initialValue)

const link = (_ws) => { }

const msg = (msg) => {
	if (msg.type == 'inventory') {
		msg.info.inventory.forEach((item, i) => {
			const blob = new Blob([item.preview], { type: `image/png` })
			msg.info.inventory[i].previewURL = URL.createObjectURL(blob)
		})
		msg.info.equipment.forEach((item, i) => {
			const blob = new Blob([item.preview], { type: `image/png` })
			msg.info.equipment[i].previewURL = URL.createObjectURL(blob)
		})
		ref.access().set(msg.info)
	}
}

const remove = (_e) => { }

const reset = () => ref.access().set(initialValue)

export default {
	ref,
	link,
	msg,
	remove,
	reset,
}