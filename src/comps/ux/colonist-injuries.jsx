import React from 'react'
import { useStateLink } from '@hookstate/core'
import colonist from '../../services/cmd_colonist'
import colors from '../../colors'

export default function ColonistInjuries() {
	const colonistLink = useStateLink(colonist.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridRowGap: 0,
		gridColumnGap: '10px',
		gridTemplateColumns: 'auto auto',
		alignItems: 'start',
		fontSize: '0.8em',
	}

	const doInjury = (injury, hediffs) => {
		const fixColor = (color) =>
			colors.rgb(
				colors.saturateColor(
					colors.contrastColor(color, (c) => c - 48),
					1
				)
			)
		return (
			<React.Fragment key={injury.name}>
				<div style={{ color: fixColor(injury.rgb) }}>{injury.name}</div>
				<div style={{ textAlign: 'right' }}>
					{hediffs.map((hediff, idx) => (
						<React.Fragment key={hediff.name}>
							<span style={{ color: fixColor(hediff.rgb) }}>
								{hediff.name}
								{hediff.count > 1 ? ` ${hediff.count}x` : ''}
							</span>
							{idx < hediffs.length - 1 ? ', ' : ''}
						</React.Fragment>
					))}
				</div>
			</React.Fragment>
		)
	}

	return <div style={grid}>{colonistLink.value.injuries.map((injury) => doInjury(injury, injury.hediffs))}</div>
}
