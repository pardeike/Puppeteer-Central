import React from 'react'
import { useStateLink } from '@hookstate/core'
import { skillBar } from '../ux/bars'
import colonist from '../../services/cmd_colonist'

export default function ColonistSkills() {
	const colonistLink = useStateLink(colonist.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridRowGap: '10px',
		gridColumnGap: '10px',
		gridTemplateColumns: 'auto auto minmax(50%, 99%)',
		fontSize: '0.8em',
	}

	return (
		<div style={grid}>
			{colonistLink.value.skills?.map((skill) => (
				<React.Fragment key={skill.name}>
					<div style={{ whiteSpace: 'nowrap' }}>{skill.name}</div>
					{skill.passion ? <img src={`/i/passion${skill.passion}.png`} /> : <div />}
					{skillBar(skill)}
				</React.Fragment>
			))}
		</div>
	)
}
