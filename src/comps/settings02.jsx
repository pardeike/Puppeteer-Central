import React from 'react'
import { Card, Label } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import status from '../services/cmd_status'
import stream from '../services/cmd_stream'
import settings from '../services/cmd_settings'
import { Spacer } from '../comps/tools'
import Toggler from '../comps/toggler'
import tools from '../tools'
import togglesRef from '../hooks/toggles'

export default function Settings02() {
	const statusLink = useStateLink(status.ref)
	const streamLink = useStateLink(stream.ref)
	const settingsLink = useStateLink(settings.ref)
	const togglesLinks = useStateLink(togglesRef)

	function Connected(props) {
		return (
			<React.Fragment>
				<span style={{}}>{props.label}</span>
				<span style={{ justifySelf: 'end' }}>
					<Label color={props.status ? 'green' : 'red'}>{props.status ? 'Connected' : 'Disconnected'}</Label>
				</span>
			</React.Fragment>
		)
	}

	function Value(props) {
		return (
			<React.Fragment>
				<span style={{}}>{props.label}</span>
				<span style={{ justifySelf: 'end' }}>{props.value}</span>
			</React.Fragment>
		)
	}

	function Connections() {
		return (
			<div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gridRowGap: '10px' }}>
				<Connected label="Puppeteer Server" status={streamLink.value.connected} />
				{settingsLink.value.game && <Connected label="RimWorld" status={statusLink.value.game.connected} />}
				<Value label="Message Count" value={streamLink.value.messageCount} />
				<Value label="Last Messsage" value={tools.ago(streamLink.value.lastMessage)} />
			</div>
		)
	}

	return (
		<Card fluid>
			<Card.Content>
				<Card.Header>Game Status</Card.Header>
				<Toggler settings={togglesLinks.nested.settings02}>
					<Spacer />
					<Card.Description>
						<Connections />
					</Card.Description>
				</Toggler>
			</Card.Content>
		</Card>
	)
}
