import assignment from './cmd_assignment'
import colonist from './cmd_colonist'
import earn from './cmd_earn'
import gameinfo from './cmd_game-info'
import grid from './cmd_grid'
import jobs from './cmd_jobs'
import menu from './cmd_menu'
import ping from './cmd_ping'
import portrait from './cmd_portrait'
import settings from './cmd_settings'
import state from './cmd_state'
import status from './cmd_status'
import stream from './cmd_stream'
import streamers from './cmd_streamers'
import { BSON } from 'bsonfy'

const debug = true

const connect = () => {
	const host = document.location.host
	const proto = host.indexOf('localhost') >= 0 ? 'ws' : 'wss'
	const ws = new WebSocket(`${proto}://${host}/connect`)
	ws.binaryType = 'arraybuffer'
	ws.onopen = () => {
		assignment.link(ws)
		colonist.link(ws)
		earn.link(ws)
		gameinfo.link(ws)
		grid.link(ws)
		jobs.link(ws)
		menu.link(ws)
		ping.link(ws)
		portrait.link(ws)
		settings.link(ws)
		state.link(ws)
		status.link(ws)
		stream.link(ws)
		streamers.link(ws)
	}
	ws.onclose = (e) => {
		assignment.remove(e)
		colonist.remove(e)
		earn.remove(e)
		gameinfo.remove(e)
		grid.remove(e)
		jobs.remove(e)
		menu.remove(e)
		ping.remove(e)
		portrait.remove(e)
		settings.remove(e)
		state.remove(e)
		status.remove(e)
		stream.remove(e)
		streamers.remove(e)
		setTimeout(connect, 1000)
	}
	ws.onmessage = (e) => {
		var bytes = new Uint8Array(e.data)
		const msg = BSON.deserialize(bytes)
		//if (debug && 'portrait,earn,colonist-basics'.indexOf(msg['type']) == -1)
		//	console.log(`--> ${msg['type'].toUpperCase()} ${Object.keys(msg).join(' ')}`)
		assignment.msg(msg)
		colonist.msg(msg)
		earn.msg(msg)
		gameinfo.msg(msg)
		grid.msg(msg)
		jobs.msg(msg)
		menu.msg(msg)
		ping.msg(msg)
		portrait.msg(msg)
		settings.msg(msg)
		state.msg(msg)
		status.msg(msg)
		stream.msg(msg)
		streamers.msg(msg)
	}
}
export default connect
