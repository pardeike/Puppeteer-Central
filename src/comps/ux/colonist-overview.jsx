import React, { useEffect, createRef } from 'react'
import { Segment, Dropdown, Image } from 'semantic-ui-react'
import { percentageBar, colorBar } from './bars'
import { useStateLink } from '@hookstate/core'
import NoAssignment from '../ux/no-assignment'
import onmap from '../../services/cmd_on-map'
import portrait from '../../services/cmd_portrait'
import colonist from '../../services/cmd_colonist'
import state from '../../services/cmd_state'
import commands from '../../commands'
import createDOMPurify from 'dompurify'

export default function ColonistOverview() {
	const portraitLink = useStateLink(portrait.ref)
	const stateLink = useStateLink(state.ref)
	const colonistLink = useStateLink(colonist.ref)
	const DOMPurify = createDOMPurify(window)

	const canvasRef = createRef()

	const nGrid = (cols) => ({
		display: 'grid',
		gridColumnGap: '10px',
		gridRowGap: '10px',
		textAlign: 'left',
		gridTemplateColumns: cols,
		fontSize: '0.8em',
	})

	const colonistPortrait = {
		backgroundColor: '#b8b8b8',
		width: '64px',
		height: '64px',
		marginRight: '10px',
		textAlign: 'center',
		position: 'relative',
	}

	const colonistImage = {
		maxWidth: 56,
		maxHeight: 56,
		margin: 4,
		backgroundColor: 'transparent',
	}

	const draft = {
		position: 'absolute',
		top: 2,
		left: 2,
		width: 16,
		height: 16,
	}

	const getZoneOptions = () => {
		const choices = stateLink.value.zones.map((z) => ({
			key: z,
			text: z,
			value: z,
		}))
		choices.unshift({ key: '', text: 'Unrestricted', value: '' })
		return choices
	}

	useEffect(() => {
		const updateCanvas = async () => {
			const x = (colonistLink.value.x * 32) / colonistLink.value.mx
			const y = 32 - (colonistLink.value.y * 32) / colonistLink.value.my
			const ctx = canvasRef.current.getContext('2d')
			ctx.save()
			ctx.clearRect(0, 0, 32, 32)
			ctx.fillStyle = 'rgba(0,0,0,0.25)'
			ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
			ctx.beginPath()
			ctx.arc(x, y, 1.5, 0, 2 * Math.PI, false)
			ctx.fillStyle = 'white'
			ctx.fill()
			ctx.restore()
		}
		if (canvasRef && canvasRef.current && colonistLink.value) updateCanvas()
	})

	if (!colonistLink.value.name) return <NoAssignment />

	return (
		<Segment.Group>
			<Segment>
				<div style={nGrid('auto 128px')}>
					<div style={{ display: 'flex', flexWrap: 'wrap' }}>
						<div style={colonistPortrait}>
							{colonistLink.value.drafted && <img src="/i/drafted.png" style={draft} />}
							<img src={portraitLink.value} style={colonistImage} />
						</div>
						<div>
							<div>
								<b>{colonistLink.value.name}</b>
							</div>
							{colonistLink.value.inspect
								.filter((_line, i) => i != 0)
								.map((line, i) => (
									<div key={i}>{DOMPurify.sanitize(line)}</div>
								))}
						</div>
					</div>
					<div style={{ position: 'relative', width: 128, height: 128 }}>
						<Image src={onmap.ref.access().get()} style={{ position: 'absolute' }} />
						<canvas ref={canvasRef} width="32" height="32" style={{ position: 'absolute', right: 2, bottom: 2 }}></canvas>
					</div>
				</div>
				<div style={{ ...nGrid('repeat(4, auto)'), paddingTop: '10px' }}>
					{percentageBar(colonistLink.value.health, 'health')}
					{percentageBar(colonistLink.value.mood, 'mood', 0.4)}
					{colorBar(colonistLink.value.restrict, 'schedule')}
					<Dropdown
						icon={<div />}
						trigger={colorBar(colonistLink.value.area, 'zone')}
						options={getZoneOptions()}
						value={colonistLink.value.area.label}
						onChange={(_e, data) => commands.setZone(data.value)}
					/>
				</div>
				{colonistLink.value.bleedingRate > 1 ? (
					<div style={{ ...nGrid('auto auto'), paddingTop: '10px' }}>
						<b>Bleeding: {colonistLink.value.bleedingRate}% per day</b>
						{colonistLink.value.deathIn < 24 ? (
							<b style={{ textAlign: 'right' }}>Death in {colonistLink.value.deathIn} hours</b>
						) : (
							<div style={{ textAlign: 'right' }}>No immediate danger</div>
						)}
					</div>
				) : undefined}
			</Segment>
		</Segment.Group>
	)
}
