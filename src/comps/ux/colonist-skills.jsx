import React from 'react'
import { Segment, Popup } from 'semantic-ui-react'
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

	const header = {
		display: 'grid',
		gridRowGap: '10px',
		textAlign: 'left',
		gridTemplateColumns: 'auto',
		fontSize: '0.8em',
	}

	const tag = (t, i) => {
		if (!t.name) return <span>—</span>
		return (
			<span key={i} style={{ whiteSpace: 'nowrap', padding: '2px 6px 2px 6px', marginRight: 4, backgroundColor: '#ddd' }}>
				{t.name}{' '}
				<Popup
					offset={-8}
					content={
						<span
							style={{ whiteSpace: 'pre-wrap' }}
							dangerouslySetInnerHTML={{
								__html: t.info,
							}}
						/>
					}
					size="mini"
					trigger={<img src="/i/info.png" style={{ position: 'relative', left: 2, top: 2, width: 13, height: 13 }} />}
				/>
			</span>
		)
	}

	const row = { paddingTop: '4px' }
	const history = { __html: colonistLink.value.inspect[0] }

	return (
		<Segment.Group>
			<Segment raised style={header}>
				<div>
					<b style={row} dangerouslySetInnerHTML={history}></b>
					<div style={row}>Childhood: {tag(colonistLink.value.childhood)}</div>
					<div style={row}>Adulthood: {tag(colonistLink.value.adulthood)}</div>
				</div>
				<div>
					<b>Incapable of</b>
					<br />
					{colonistLink.value.incapable.map(tag)}
				</div>
				<div>
					<b>Traits</b>
					<br />
					{colonistLink.value.traits.map(tag)}
				</div>
			</Segment>
			<Segment raised>
				<div style={grid}>
					{colonistLink.value.skills?.map((skill, i) => (
						<React.Fragment key={i}>
							<div style={{ whiteSpace: 'nowrap' }}>{skill.name}</div>
							{skill.passion ? <img src={`/i/passion${skill.passion}.png`} /> : <div />}
							{skillBar(skill)}
						</React.Fragment>
					))}
				</div>
			</Segment>
		</Segment.Group>
	)
}
