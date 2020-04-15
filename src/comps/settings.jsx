import React, { useState } from 'react'
import { Button, Card } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import status from '../services/cmd_status'
import tools from '../tools'
import Settings01 from './settings01'
import Settings02 from './settings02'
import Settings03 from './settings03'
import Settings04 from './settings04'

export default function Settings() {
	const statusLink = useStateLink(status.ref)
	const [mode, setMode] = useState(statusLink.value.game.connected ? 'streamer' : 'viewer')

	return (
		<React.Fragment>
			<span style={{ color: 'white', fontWeight: '700', marginRight: '10px' }}>Filter</span>
			<Button.Group compact size="tiny" toggle style={{ marginBottom: '20px' }}>
				<Button active={mode == 'viewer'} onClick={() => setMode('viewer')}>
					Viewer
				</Button>
				<Button active={mode == 'streamer'} onClick={() => setMode('streamer')}>
					Streamer
				</Button>
			</Button.Group>
			<span style={{ color: 'white', opacity: 0.2, float: 'right' }}>{tools.version}</span>
			<Card.Group>
				<Settings01 mode={mode} />
				<Settings02 mode={mode} />
				<Settings03 mode={mode} />
				<Settings04 mode={mode} />
			</Card.Group>
		</React.Fragment>
	)
}
