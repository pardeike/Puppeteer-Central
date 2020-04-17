import fetch from 'node-fetch'
import React, { useState } from 'react'
import { Button, Card, Label, Segment, Header } from 'semantic-ui-react'
import Toggler from '../comps/toggler'
import { useStateLink } from '@hookstate/core'
import settings from '../services/cmd_settings'
import togglesRef from '../hooks/toggles'

export default function Settings01(props) {
	const [token, setToken] = useState('')
	const [usageInfo, setUsageInfo] = useState(false)
	const settingsLinks = useStateLink(settings.ref)
	const togglesLinks = useStateLink(togglesRef)
	const tokenPrefix = 'data:application/octet-stream,'
	const tokenFilename = 'PuppeteerToken.txt'

	const generateToken = async () => {
		const response = await fetch('/game-token')
		const info = await response.json()
		setToken(info.token)
		settings.update('game', info.game)
		setUsageInfo(true)
	}

	const dismissTokenInformation = () => {
		setUsageInfo(false)
		setToken('')
	}

	const revokeToken = async () => {
		setToken('')
		settings.update('game', '')
		setUsageInfo(false)
	}

	const downloadTokenButton = () => {
		return (
			<React.Fragment>
				<style>{`
					.download-link {
						padding: 1px 3px 1px 3px;
						background-color: #2185d0;
						color: white;
						font-size: 9pt;
						cursor: pointer;
					}
					.download-link:hover {
						background-color: #336890;
						color: white;
					}
				`}</style>
				<a className="download-link" download={tokenFilename} href={tokenPrefix + token}>
					{tokenFilename}
				</a>
			</React.Fragment>
		)
	}

	const box = {
		wordBreak: 'break-word',
		fontSize: '9pt',
		fontFamily: 'monospace',
		marginBottom: '8px',
	}

	const note = {
		color: 'red',
		fontSize: '11px',
	}

	const createTokenCard = () => {
		return (
			<React.Fragment>
				<Header size="tiny" style={note}>
					For RimWorld Streamers
				</Header>
				<Segment.Group>
					<Segment>
						<p>In order to authorize your game and to connect it to this account, you need to install a token.</p>
						<Button size="tiny" primary compact onClick={generateToken} disabled={usageInfo}>
							Generate Game Token
						</Button>
					</Segment>
					{usageInfo && (
						<Segment>
							<p>Download {downloadTokenButton()} and place it in your RimWorld 'Config' directory:</p>
							<Label style={box}>%LocalAppData%\..\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Config</Label>
							<p>
								<span style={{ color: 'red' }}>Beware:</span> this file is very sensitive. Do not show or copy it to anybody else!
							</p>
							<Button size="tiny" primary compact onClick={dismissTokenInformation}>
								Done
							</Button>
						</Segment>
					)}
				</Segment.Group>
			</React.Fragment>
		)
	}

	const revokeCard = () => {
		return (
			<React.Fragment>
				<React.Fragment>
					<p>
						A game token with id <b>{settingsLinks.nested.game.value}</b> is active. If you think your game token is somehow compromised or if you want to
						create a new token, you must first revoke the current token:
					</p>
					<Button size="tiny" compact onClick={revokeToken}>
						Revoke Game Token
					</Button>
				</React.Fragment>
			</React.Fragment>
		)
	}

	if (props.mode != 'streamer') return <React.Fragment></React.Fragment>

	return (
		<Card fluid>
			<Card.Content>
				<Card.Header>Connecting RimWorld</Card.Header>
				<Toggler settings={togglesLinks.nested.settings01}>
					<Card.Description>{settingsLinks.nested.game.value && !usageInfo ? revokeCard() : createTokenCard()}</Card.Description>
				</Toggler>
			</Card.Content>
		</Card>
	)
}
