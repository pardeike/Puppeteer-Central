import React from 'react'
import { Button, Card, Image } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import status from '../services/cmd_status'

export default function Profile() {
	const statusLink = useStateLink(status.ref)

	const description = () => {
		return statusLink.value.game.connected ? 'Streamer' : 'Viewer'
	}

	const gameState = () => {
		return `${statusLink.value.game.connected ? 'Game connected ✅' : 'Game not connected ❌'}`
	}

	const logout = () => {
		document.location = '/logout'
	}

	return (
		<Card fluid>
			{statusLink.value.user.picture && <Image src={statusLink.value.user.picture} size="medium" centered />}
			<Card.Content>
				<Card.Header>{statusLink.value.user.name}</Card.Header>
				<Card.Meta>{description()}</Card.Meta>
				{statusLink.value.game.connected && <Card.Description>{gameState()}</Card.Description>}
			</Card.Content>
			<Card.Content textAlign="center">
				<Button size="tiny" compact onClick={logout}>
					Logout
				</Button>
			</Card.Content>
		</Card>
	)
}
