import React from 'react'
import { valueSelector } from './value-selector'
import { useStateLink } from '@hookstate/core'
import colonist from '../../services/cmd_colonist'
import commands from '../../commands'
import ActiveMenu from './active-menu'

export default function ColonistBasicCommands() {
	const colonistLink = useStateLink(colonist.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridColumnGap: '10px',
		gridRowGap: '10px',
		textAlign: 'left',
		fontSize: '0.8em',
	}

	const getDraftModi = () => {
		return [
			{ key: 'Drafted', text: 'Drafted', value: true },
			{ key: 'Undrafted', text: 'Undrafted', value: false },
		]
	}

	const getHostileResponses = () => {
		return ['Ignore', 'Attack', 'Flee'].map((a) => ({
			key: a,
			text: a,
			value: a,
			image: { src: `/i/response-${a.toLowerCase()}.png`, style: { paddingTop: '6px' } },
		}))
	}

	return (
		<div style={grid} className="basicCommandsColumns">
			{valueSelector('Draft Status:', colonistLink.value.drafted, getDraftModi(), (val) => commands.setDraftModus(val))}
			{valueSelector('Mode:', colonistLink.value.response, getHostileResponses(), (val) => commands.setHostileResponse(val))}
			<div className="basicCommandsColumnsHeader">Attack</div>
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Ranged:</div>
			<ActiveMenu
				placeholder="Choose enemy"
				optionsCommand="get-attack-targets"
				optionsArgs={['false']}
				actionCommand="attack-target"
				actionArgs={['false']}
			/>
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Melee:</div>
			<ActiveMenu
				placeholder="Choose enemy"
				optionsCommand="get-attack-targets"
				optionsArgs={['true']}
				actionCommand="attack-target"
				actionArgs={['true']}
			/>
			<div className="basicCommandsColumnsHeader">Equip Weapons</div>
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Nearest:</div>
			<ActiveMenu placeholder="Weapons" optionsCommand="get-weapons" optionsArgs={['near']} actionCommand="select-weapon" actionArgs={[]} />
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Best:</div>
			<ActiveMenu placeholder="Weapons" optionsCommand="get-weapons" optionsArgs={['best']} actionCommand="select-weapon" actionArgs={[]} />
			<div className="basicCommandsColumnsHeader">Policies</div>
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Outfits:</div>
			<ActiveMenu placeholder="Outfits" optionsCommand="get-outfits" optionsArgs={[]} actionCommand="select-outfit" actionArgs={[]} />
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Drugs:</div>
			<ActiveMenu placeholder="Drugs" optionsCommand="get-drugs" optionsArgs={[]} actionCommand="select-drug" actionArgs={[]} />
			<div className="basicCommandsColumnsHeader">Injuries</div>
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Rest:</div>
			<ActiveMenu placeholder="Beds" optionsCommand="get-rest" optionsArgs={['rest']} actionCommand="do-rest" actionArgs={[]} />
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>Tend:</div>
			<ActiveMenu placeholder="Pawns" optionsCommand="get-tend" optionsArgs={['tend']} actionCommand="do-tend" actionArgs={[]} />
		</div>
	)
}
