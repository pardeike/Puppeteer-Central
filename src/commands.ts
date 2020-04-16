import assignment from './services/cmd_assignment'
import colonist from './services/cmd_colonist'
import onmap from './services/cmd_on-map'
import portrait from './services/cmd_portrait'
import settings from './services/cmd_settings'
import stream from './services/cmd_stream'
import tools from './tools'

const joinGame = (user) => {
	const userCreds = {
		id: user.id,
		service: user.service,
	}
	//console.log(`--> join game ${user.service}:${user.id}`)
	stream.join(userCreds)
	settings.update('viewing', userCreds)
	tools.goto('game')
}

const leaveGame = (fully) => {
	//console.log(`--> leave game${fully ? ' fully' : ''}`)
	if (fully) {
		settings.update('viewing', {
			id: undefined,
			service: undefined,
		})
		stream.leave()
	}
	assignment.reset()
	portrait.reset()
	onmap.reset()
	colonist.reset()
	if (fully) tools.goto('lobby')
}

const setDraftModus = (val) => {
	stream.state('drafted', val)
}

const setHostileResponse = (val) => {
	stream.state('hostile-response', val)
}

const setZone = (val) => {
	stream.state('zone', val)
}

const tickPriority = (idx, prio) => {
	stream.state('priority', idx * 100 + prio)
}

const tickSchedule = (idx, sched) => {
	stream.state('schedule', `${idx}:${sched}`)
}

const setGridSize = (n) => {
	stream.state('grid', `${n}`)
}

const goto = (px, pz) => {
	stream.state('goto', `${px},${pz}`)
}

export default {
	joinGame,
	leaveGame,
	setDraftModus,
	setHostileResponse,
	setZone,
	tickPriority,
	tickSchedule,
	setGridSize,
	goto,
}
