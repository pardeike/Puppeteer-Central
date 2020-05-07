import React from 'react'
import { useStateLink } from '@hookstate/core'
import routesRef from '../hooks/routes'
import settings from '../services/cmd_settings'
import streamers from '../services/cmd_streamers'
import AccountProxy from '../comps/acount-proxy'
import tools from '../tools'

export default function Header() {
	const routesLink = useStateLink(routesRef)
	const settingsLink = useStateLink(settings.ref)
	const streamersLink = useStateLink(streamers.ref)

	const viewing = settingsLink.value.viewing
	const streamer = viewing ? streamersLink.value.find((s) => s.user.id == viewing.id && s.user.service == viewing.service) : undefined

	if (streamer && tools.firstTime()) {
		setTimeout(() => routesLink.nested.current.set('game'), 0)
	}

	const headerGridStyle = () => {
		const items = 'auto '.repeat(routesLink.value.pages.length)
		return { gridTemplateColumns: `${items}1fr auto auto` }
	}

	const tabStyle = (info) => {
		var result = 'menu'
		if (info[0] == 'game' && !streamer) result += ' inactive'
		if (info[0] == routesLink.value.current) result += ' selected'
		return result
	}

	const selectTab = (info) => () => {
		if (info[0] != 'game' || streamer) routesLink.nested.current.set(info[0])
	}

	return (
		<div id="header" style={headerGridStyle()}>
			{routesLink.value.pages.map((pair) => (
				<div key={pair[0]} className={tabStyle(pair)} onClick={selectTab(pair)}>
					{pair[1]}
				</div>
			))}
			<span style={{ fontSize: '0.6em', color: 'rgba(255,255,255,0.2)', textAlign: 'right' }}>{tools.version}</span>
			<AccountProxy />
		</div>
	)
}
