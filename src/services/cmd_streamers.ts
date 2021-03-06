import { createStateLink } from '@hookstate/core'
import { Mutate } from '@hookstate/mutate'
import stream from '../services/cmd_stream'
import settings from './cmd_settings'

const initialValue = []
const ref = createStateLink(initialValue)
const streamers = ref.access()

const link = (_ws) => {}

const msg = (msg) => {
	if (msg.type == 'streamers') {
		Mutate(streamers).set(msg.streamers)
	}
	if (msg.type == 'streamer') {
		const streamer = msg.streamer
		const online = streamer.info.online

		const idx = streamers.get().findIndex((s) => s.user.id == streamer.user.id && s.user.service == streamer.user.service)
		if (idx >= 0) {
			if (online) Mutate(streamers).update(idx, streamer)
			else Mutate(streamers).remove(idx)
		} else {
			if (online) {
				Mutate(streamers).push(streamer)
				const viewing = settings.ref.access().value.viewing
				if (viewing && viewing.id == streamer.user.id && viewing.service == streamer.user.service) {
					stream.join(viewing)
				}
			}
		}
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
