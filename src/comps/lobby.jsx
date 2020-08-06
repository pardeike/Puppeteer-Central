import React, { useState, useEffect } from 'react'
import { useStateLink } from '@hookstate/core'
import { Label, Card, Header, Segment, Image } from 'semantic-ui-react'
import Img from 'react-image'
import streamers from '../services/cmd_streamers'
import commands from '../commands'
import tools from '../tools'

export default function Lobby() {
	const streamersLink = useStateLink(streamers.ref)
	const [windowWidth, setWindowWidth] = useState(0)

	useEffect(() => {
		const resizeWindow = () => setWindowWidth(window.innerWidth)
		resizeWindow()
		window.addEventListener('resize', resizeWindow)
		return () => window.removeEventListener('resize', resizeWindow)
	}, [])

	const isMobileFormFactor = windowWidth < 650
	const rowCount = isMobileFormFactor ? 1 : 2

	let w = windowWidth
	if (!isMobileFormFactor) w /= 2
	const buttonSize = w < 420 ? (w < 365 ? 'tiny' : 'small') : 'large'

	const joinStyle = {
		cursor: 'pointer',
		paddingLeft: '24px',
		paddingRight: '24px',
		justifySelf: 'end',
	}

	const minButton = {
		whiteSpace: 'nowrap',
		paddingLeft: '14px',
		paddingRight: '14px',
	}

	const buttonGrid = {
		display: 'grid',
		gridColumnGap: '4px',
		gridTemplateColumns: 'auto auto minmax(1%,90%) auto',
	}

	const stats = {
		position: 'relative',
		top: '2px',
	}

	const Streamer = (prop) => {
		const streamer = prop.streamer

		const previewURL = (user) => {
			var pictureURL = '/i/preview.jpg'
			switch (user.service) {
				case 'twitch':
					const lowerName = user.name.toLowerCase()
					pictureURL = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${lowerName}-320x180.jpg`
					break
				case 'youtube':
					pictureURL = `/youtube-preview/${user.id}`
					break
			}
			return [pictureURL, '/i/preview.jpg']
		}

		const openStream = () => {
			window.open(`https://twitch.tv/${streamer.user.name}`, '_blank')
		}

		return (
			<Card>
				<Image wrapped ui={false} onClick={() => commands.joinGame(streamer.user)} style={{ cursor: 'pointer' }}>
					<Img src={previewURL(streamer.user)} loader={<img src="/i/preview.jpg" />} />
				</Image>
				<Card.Content>
					<Image floated="right" size="mini" src={streamer.user.picture} circular />
					<Card.Header>
						{streamer.user.service == 'twitch' ? (
							<React.Fragment>
								<span>{streamer.user.name}</span>
								<img src="/i/link.png" style={{ paddingLeft: 10, paddingBottom: 3, cursor: 'pointer' }} onClick={() => openStream()} />
							</React.Fragment>
						) : (
							streamer.user.name
						)}
					</Card.Header>
					<Card.Meta>Online since {tools.ago(streamer.info.started)}</Card.Meta>
					<Card.Description>
						<b>{streamer.info.title || 'Untitled'}</b>
					</Card.Description>
				</Card.Content>
				<Card.Content extra>
					<div style={buttonGrid}>
						<div>
							<Label basic image style={{ border: 0 }}>
								<img src="/i/puppet.png" height="26" />
								<span style={stats}>{streamer.puppets}</span>
							</Label>
							<Label basic image style={{ border: 0 }}>
								<img src="/i/colonist.png" height="26" />
								<span style={stats}>{streamer.colonists}</span>
							</Label>
						</div>
						{streamer.info.matureOnly ? (
							<div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
								<Label size="mini" color="red">
									<span style={{ fontSize: '1.2em' }}>Mature</span>
								</Label>
							</div>
						) : (
							<div style={minButton} />
						)}
						<div />
						<Label size={buttonSize} color="green" style={joinStyle} onClick={() => commands.joinGame(streamer.user)}>
							Join
						</Label>
					</div>
				</Card.Content>
			</Card>
		)
	}

	return (
		<React.Fragment>
			<Header style={{ color: 'white', fontWeight: '700' }}>Available Games</Header>
			<Segment basic>
				<Card.Group itemsPerRow={rowCount} style={{ margin: '-2em', marginTop: '-1em' }}>
					{streamersLink.value.map((streamer) => (
						<Streamer key={`${streamer.user.id}:${streamer.user.service}`} streamer={streamer} />
					))}
				</Card.Group>
			</Segment>
		</React.Fragment>
	)
}
