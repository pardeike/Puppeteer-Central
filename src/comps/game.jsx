import React from 'react'
import { Segment, Tab, Menu } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import ColonistBasicCommands from './ux/colonist-basic-commands'
import ColonistCapacities from './ux/colonist-capacities'
import ColonistCombat from './ux/colonist-combat'
import ColonistMood from './ux/colonist-mood'
import ColonistOverview from './ux/colonist-overview'
import ColonistSchedules from './ux/colonist-schedules'
import ColonistSkills from './ux/colonist-skills'
import ColonistThoughts from './ux/colonist-thoughts'
import GameHeader from './ux/game-header'
import colonist from '../services/cmd_colonist'
import ColonistInjuries from './ux/colonist-injuries'

export default function Game() {
	const colonistFlagsLink = useStateLink(colonist.flagsRef)

	const menu = (name, enabled, content) => ({
		menuItem: (
			<Menu.Item key={name}>
				<img src={`/i/tabs/${name}.png`} style={{ width: 24, height: 24, opacity: enabled ? 1 : 0.25 }} />
			</Menu.Item>
		),
		render: () => (enabled ? content : undefined),
	})

	const panes = [
		menu('state', true, <ColonistBasicCommands />),
		menu('combat', true, <ColonistCombat />),
		menu(
			'injury',
			colonistFlagsLink.value.injuries || colonistFlagsLink.value.capacities,
			<React.Fragment>
				<ColonistInjuries />
				<ColonistCapacities />
			</React.Fragment>
		),
		menu('mood', true, <ColonistMood />),
		menu('mind', colonistFlagsLink.value.thoughts, <ColonistThoughts />),
		menu('skill', colonistFlagsLink.value.skills, <ColonistSkills />),
		menu('schedule', true, <ColonistSchedules />),
	]

	return (
		<React.Fragment>
			<GameHeader />
			<ColonistOverview />
			{colonistFlagsLink.value.assigned ? (
				<Segment.Group>
					<Segment>
						<Tab panes={panes} />
					</Segment>
				</Segment.Group>
			) : undefined}
		</React.Fragment>
	)
}
