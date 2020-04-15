import React from 'react'
import { Segment, Tab, Menu } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import ColonistBasicCommands from './ux/colonist-basic-commands'
import ColonistCapacities from './ux/colonist-capacities'
import ColonistMood from './ux/colonist-mood'
import ColonistOverview from './ux/colonist-overview'
import ColonistSchedules from './ux/colonist-schedules'
import ColonistSkills from './ux/colonist-skills'
import ColonistThoughts from './ux/colonist-thoughts'
import NoAssignment from './ux/no-assignment'
import GameHeader from './ux/game-header'
import colonist from '../services/cmd_colonist'
import settings from '../services/cmd_settings'
import streamers from '../services/cmd_streamers'
import ColonistInjuries from './ux/colonist-injuries'

export default function Game() {
	const colonistLink = useStateLink(colonist.ref)
	const settingsLink = useStateLink(settings.ref)
	const streamersLink = useStateLink(streamers.ref)

	const viewing = settingsLink.value.viewing
	const streamer = viewing ? streamersLink.value.find((s) => s.user.id == viewing.id && s.user.service == viewing.service) : undefined

	const menu = (name, enabled, content) => ({
		menuItem: (
			<Menu.Item key={name}>
				<img src={`/i/tabs/${name}.png`} style={{ width: 24, height: 24, opacity: enabled ? 1 : 0.25 }} />
			</Menu.Item>
		),
		render: () => (enabled ? content : undefined),
	})

	if (!colonistLink.value.name) return <NoAssignment />

	const panes = [
		menu('state', true, <ColonistBasicCommands />),
		menu(
			'injury',
			colonistLink.value.injuries?.length || colonistLink.value.capacities?.length,
			<React.Fragment>
				<ColonistInjuries />
				<ColonistCapacities />
			</React.Fragment>
		),
		menu('mood', true, <ColonistMood />),
		menu('mind', colonistLink.value.thoughts?.length, <ColonistThoughts />),
		menu('skill', colonistLink.value.skills?.length, <ColonistSkills />),
		menu('schedule', true, <ColonistSchedules />),
	]

	return (
		<React.Fragment>
			{streamer ? (
				<React.Fragment>
					<GameHeader streamer={streamer} />
					<Segment.Group>
						<Segment>
							<ColonistOverview />
						</Segment>
					</Segment.Group>
					<Segment.Group>
						<Segment>
							<Tab panes={panes} />
						</Segment>
					</Segment.Group>
				</React.Fragment>
			) : undefined}
		</React.Fragment>
	)
}
