import React from 'react'
import { Header, Button, Label, Image, Loader, Icon } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import commands from '../../commands'
import earn from '../../services/cmd_earn'
import settings from '../../services/cmd_settings'
import streamers from '../../services/cmd_streamers'
import tools from '../../tools'

export default function GameHeader() {
	const earnLink = useStateLink(earn.ref)
	const settingsLink = useStateLink(settings.ref)
	const streamersLink = useStateLink(streamers.ref)

	const viewing = settingsLink.value.viewing
	const streamer = viewing ? streamersLink.value.find((s) => s.user.id == viewing.id && s.user.service == viewing.service) : undefined

	const streamerPic = streamer?.user.picture ?? tools.defaultAvatar

	const imageStyle = {
		width: '24px',
		height: '24px',
		top: '-2px',
		marginRight: '6px',
		display: 'inline-block',
	}

	const coinLabelStyle = {
		padding: '10px !important',
		position: 'absolute',
		top: '-4px',
		right: 0,
	}

	const coinTextStyle = {
		paddingRight: '4px',
	}

	const coinSpinnerStyle = {
		height: '0.7rem',
		top: '-0.2rem',
	}

	return (
		<React.Fragment>
			<Header style={{ color: 'white', fontWeight: '700 !important' }}>
				<Button
					onClick={() => commands.leaveGame(true)}
					icon
					size="tiny"
					compact
					labelPosition="left"
					style={{ backgroundColor: 'white', fontSize: '0.8em', paddingTop: '6px', paddingBottom: '3px' }}>
					<Icon name="left arrow" />
					<Image circular src={streamerPic} style={imageStyle} /> {streamer?.user.name ?? ''}
				</Button>
			</Header>
			<Label image circular style={coinLabelStyle}>
				<img src="/i/coin.png" />
				{earnLink.value >= 0 ? <b style={coinTextStyle}>{earnLink.value}</b> : <Loader active inline size="mini" style={coinSpinnerStyle} />}
			</Label>
		</React.Fragment>
	)
}
