import React from 'react'
import { useStateLink } from '@hookstate/core'
import colonist from '../../services/cmd_colonist'
import colors from '../../colors'

export default function ColonistCapacities() {
	const colonistLink = useStateLink(colonist.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridRowGap: 0,
		gridColumnGap: '10px',
		gridTemplateColumns: 'auto auto',
		fontSize: '0.8em',
	}

	return (
		<div style={grid}>
			{colonistLink.value.capacities.map((capacity) => (
				<React.Fragment key={capacity.name}>
					<div>{capacity.name}</div>
					<b style={{ textAlign: 'right', color: colors.rgb(capacity.rgb) }}>{capacity.value}</b>
				</React.Fragment>
			))}
		</div>
	)
}
