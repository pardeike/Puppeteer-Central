import React from 'react'
import { useStateLink } from '@hookstate/core'
import routesRef from '../hooks/routes'
import Header from '../comps/header'
import Lobby from '../comps/lobby'
import Game from '../comps/game'
import Settings from '../comps/settings'

export default function App() {
	const routesLink = useStateLink(routesRef)

	const content = () => {
		switch (routesLink.value.current) {
			case 'lobby':
				return <Lobby />
			case 'game':
				return <Game />
			case 'settings':
				return <Settings />

			default:
				return undefined
		}
	}

	return (
		<React.Fragment>
			<Header />
			<div id="game">{content()}</div>
		</React.Fragment>
	)
}
