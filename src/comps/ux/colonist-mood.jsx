import React from 'react'
import { useStateLink } from '@hookstate/core'
import { moodBar } from '../ux/bars'
import colonist from '../../services/cmd_colonist'

export default function ColonistMood() {
	const colonistLink = useStateLink(colonist.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridRowGap: '10px',
		gridColumnGap: '10px',
		gridTemplateColumns: 'auto minmax(50%, 99%)',
		fontSize: '0.8em',
	}

	return (
		<div style={grid}>
			{colonistLink.value.needs.map((need) => (
				<React.Fragment key={need.name}>
					<div style={{ whiteSpace: 'nowrap' }}>{need.name}</div>
					{moodBar(need)}
				</React.Fragment>
			))}
		</div>
	)
}
