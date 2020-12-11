import React from 'react'
import { Popup } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import socials from '../../services/cmd_socials'

export default function ColonistThoughts() {
	const socialsLink = useStateLink(socials.ref)

	const grid = {
		paddingTop: '14px',
		display: 'grid',
		gridRowGap: '4px',
		gridColumnGap: '10px',
		gridTemplateColumns: 'auto auto auto auto auto',
		fontSize: '0.8em',
	}

	const tag = (rel) => {
		if (rel.ourOpinion == '') return (<span></span>)
		return (
			<Popup
				offset={-8}
				content={<span>{rel.opinions.map((opinion, i) => (
					<div key={i}>{opinion.reason} {opinion.value}</div>
					))}</span>}
				size="mini"
				trigger={<div style={colored(rel.ourOpinion)}>{rel.ourOpinion}</div>}
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

	return (
		<React.Fragment>
			<div style={grid}>
				<div><b>Type</b></div>
				<div><b>Name</b></div>
				<div style={{ textAlign: "center" }}><b>Ours</b></div>
				<div style={{ textAlign: "center" }}><b>Theirs</b></div>
				<div><b>Situation</b></div>
				{socialsLink.nested.relations.value.map((relation) => (
					<React.Fragment key={relation.pawn}>
						<div>{relation.type}</div>
						<div>{relation.pawn}</div>
						{tag(relation)}
						<div style={colored(relation.theirOpinion)}>{relation.theirOpinion}</div>
						<div>{relation.situation}</div>
					</React.Fragment>
				))}
			</div>
			<div class="ui divider"></div>
			<div><b>Last interaction: </b>{socialsLink.nested.lastInteraction.value}</div>
		</React.Fragment>
	)
}
