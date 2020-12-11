import React from 'react'
import { Popup } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import socials from '../../services/cmd_socials'

export default function ColonistThoughts() {
	const socialsLink = useStateLink(socials.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridRowGap: '0',
		gridColumnGap: '4px',
		gridTemplateColumns: 'repeat(6, auto)',
		fontSize: 'calc(min(2.5vw, 1.1em))',
		alignItems: 'center'
	}

	const tag = (opinions, ourOpinion) => {
		return (
			<Popup
				offset={-8}
				content={<span><div><b>Our opinion</b></div>{opinions.map((opinion, i) => (
					<div key={i}>{opinion.reason} {opinion.value}</div>
					))}</span>}
				size="mini"
				trigger={<span>{ourOpinion != '0' ? ourOpinion : ''}</span>}
			/>
		)
	}

	const colored = (val) => {
		let style = { textAlign: "center" }
		let n = parseInt(val)
		if (n >= 20) {
			style.backgroundColor = '#CFC'
		}
		if (n <= -20) {
			style.backgroundColor = '#FCC'
		}
		return style
	}

	const colonistImage = {
		width: '3em',
		height: '3em',
		margin: 0,
		padding: 0
	}

	return (
		<React.Fragment>
			<div style={grid}>
				{socialsLink.nested.relations.value.map((relation, i) => (
					<React.Fragment key={i}>
						<img src={relation.portraitURL} style={colonistImage} />
						<div>{relation.type.replace('Acquaintance', 'Fellow')}</div>
						<div>{relation.pawn}</div>
						<div style={colored(relation.ourOpinion)}>{relation.ourOpinion == '' ? <span/> : tag(relation.opinions, relation.ourOpinion)}</div>
						<div style={colored(relation.theirOpinion)}>{relation.ourOpinion == '' ? <span/> : <Popup
							offset={-8}
							content={<b>Their opinion</b>}
							size="mini"
							trigger={<span>{relation.theirOpinion != '0' ? relation.theirOpinion : ''}</span>}
						/>}</div>
						<div style={{ textAlign: 'right' }}>{relation.situation}</div>
					</React.Fragment>
				))}
			</div>
			<div className={'ui divider'}	></div>
			<div><b>Last interaction: </b>{socialsLink.nested.lastInteraction.value}</div>
		</React.Fragment>
	)
}
