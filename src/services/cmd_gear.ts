import { createStateLink } from '@hookstate/core'

const initialValue = {
	parts: []
}
const ref = createStateLink(initialValue)

const link = (_ws) => { }

const msg = (msg) => {
	if (msg.type == 'gear') {
		msg.info.parts.forEach((part, i) => {
			part.apparels.forEach((apparel, j) => {
				const blob = new Blob([apparel.preview], { type: `image/png` })
				msg.info.parts[i].apparels[j].previewURL = URL.createObjectURL(blob)
			})
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