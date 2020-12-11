import { createStateLink } from '@hookstate/core'
import tools from '../tools'

const initialValue = {
	relations: [],
	lastInteraction: '',
}
const ref = createStateLink(initialValue)

const link = (_ws) => { }

const msg = (msg) => {
	if (msg.type == 'socials') {
		msg.info.relations.forEach((relation, i) => {
			const blob = new Blob([relation.portrait], { type: `image/png` })
			msg.info.relations[i].portraitURL = URL.createObjectURL(blob)
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
