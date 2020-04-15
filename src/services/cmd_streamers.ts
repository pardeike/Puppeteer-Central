import { createStateLink } from '@hookstate/core'
import stream from '../services/cmd_stream'
import settings from './cmd_settings'

const initialValue = []
const ref = createStateLink(initialValue)
const streamers = ref.access()

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'streamers') {
		streamers.set(msg.streamers)
	}
	if (msg.type == 'streamer') {
		const streamer = msg.streamer
		const online = streamer.info.online

		const idx = streamers.value.findIndex((s) => s.id == streamer.info.id && s.service == streamer.info.service)
		if (idx >= 0) {
			if (online) streamers.value[idx] = streamer
			else streamers.value.splice(idx, 1)
		} else {
			if (online) {
				streamers.value.push(streamer)
				const viewing = settings.ref.access().value.viewing
				if (viewing && viewing.id == streamer.user.id && viewing.service == streamer.user.service) {
					stream.join(viewing)
				}
			}
		}

		streamers.set(streamers.value)
	}
}

const remove = (_e) => {
	streamers.set([])
}

const reset = () => ref.access().set(initialValue)

export default {
	ref,
	link,
	msg,
	remove,
	reset,
}
