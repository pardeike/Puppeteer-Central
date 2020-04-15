import React from 'react'
import { useStateLink } from '@hookstate/core'
import colonist from '../../services/cmd_colonist'

export default function ColonistThoughts() {
	const colonistLink = useStateLink(colonist.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridRowGap: '4px',
		gridColumnGap: '10px',
		gridTemplateColumns: 'minmax(75%, 99%) auto',
		fontSize: '0.8em',
	}

	const expires = (min, max) => {
		if (min == 0 && max == 0) return ''
		if (min == max) return `, expires in ${min}h`
		return `, expires between ${min}h and ${max}h`
	}

	return (
		<div style={grid}>
			{colonistLink.value.thoughts.map((thought) => (
				<React.Fragment key={thought.name}>
					<div>
						{thought.name}
						{expires(thought.min, thought.max)}
					</div>
					<b style={{ textAlign: 'right', color: thought.value > 0 ? 'green' : 'red' }}>{thought.value}</b>
				</React.Fragment>
			))}
		</div>
	)
}
