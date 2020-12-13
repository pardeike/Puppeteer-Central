import assignment from './cmd_assignment'
import chat from './cmd_chat'
import colonist from './cmd_colonist'
import earn from './cmd_earn'
import gameinfo from './cmd_game-info'
import gear from './cmd_gear'
import grid from './cmd_grid'
import jobs from './cmd_jobs'
import menu from './cmd_menu'
import ping from './cmd_ping'
import portrait from './cmd_portrait'
import selection from './cmd_selection'
import settings from './cmd_settings'
import socials from './cmd_socials'
import state from './cmd_state'
import status from './cmd_status'
import stream from './cmd_stream'
import streamers from './cmd_streamers'
import timeinfo from './cmd_time-info'
import { BSON } from 'bsonfy'
import { debugValue } from '../comps/tools'

const debug = false

const connect = () => {
	const host = document.location.host
	const proto = host.indexOf('localhost') >= 0 || host.indexOf('andreaspc.local') >= 0 ? 'ws' : 'wss'
	const ws = new WebSocket(`${proto}://${host}/connect`)
	ws.binaryType = 'arraybuffer'
	ws.onopen = () => {
		assignment.link(ws)
		chat.link(ws)
		colonist.link(ws)
		earn.link(ws)
		gameinfo.link(ws)
		gear.link(ws)
		grid.link(ws)
		jobs.link(ws)
		menu.link(ws)
		ping.link(ws)
		portrait.link(ws)
		selection.link(ws)
		settings.link(ws)
		socials.link(ws)
		state.link(ws)
		status.link(ws)
		stream.link(ws)
		streamers.link(ws)
		timeinfo.link(ws)
	}
	ws.onclose = (e) => {
		assignment.remove(e)
		chat.remove(e)
		colonist.remove(e)
		earn.remove(e)
		gameinfo.remove(e)
		gear.remove(e)
		grid.remove(e)
		jobs.remove(e)
		menu.remove(e)
		ping.remove(e)
		portrait.remove(e)
		selection.remove(e)
		settings.remove(e)
		socials.remove(e)
		state.remove(e)
		status.remove(e)
		stream.remove(e)
		streamers.remove(e)
		timeinfo.remove(e)
		setTimeout(connect, 1000)
	}
	ws.onmessage = (e) => {
		var bytes = new Uint8Array(e.data)
		const msg = BSON.deserialize(bytes)

		// debug
		if (debug && 'portrait,earn,colonist-basics'.indexOf(msg['type']) == -1) {
			console.log(`=> ${msg['type'].toUpperCase()} ${debugValue(msg)}`)
		}

		assignment.msg(msg)
		chat.msg(msg)
		colonist.msg(msg)
		earn.msg(msg)
		gameinfo.msg(msg)
		gear.msg(msg)
		grid.msg(msg)
		jobs.msg(msg)
		menu.msg(msg)
		ping.msg(msg)
		portrait.msg(msg)
		selection.msg(msg)
		settings.msg(msg)
		socials.msg(msg)
		state.msg(msg)
		status.msg(msg)
		stream.msg(msg)
		streamers.msg(msg)
		timeinfo.msg(msg)
	}
}
export default connect
