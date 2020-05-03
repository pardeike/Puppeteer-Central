import React, { useEffect, createRef } from 'react'
import { Segment, Dropdown, Image } from 'semantic-ui-react'
import { percentageBar, colorBar } from './bars'
import { useStateLink } from '@hookstate/core'
import NoAssignment from '../ux/no-assignment'
import portrait from '../../services/cmd_portrait'
import colonist from '../../services/cmd_colonist'
import grid from '../../services/cmd_grid'
import state from '../../services/cmd_state'
import commands from '../../commands'
import createDOMPurify from 'dompurify'

export default function ColonistOverview() {
	const frameLink = useStateLink(grid.frameRef)
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

	const mapSize = 128
	const frame = frameLink.value
	useEffect(() => {
		const updateCanvas = async () => {
			const mx = colonistLink.value.mx
			const my = colonistLink.value.my
			const x = (colonistLink.value.x * mapSize) / mx
			const y = mapSize - (colonistLink.value.y * mapSize) / my
			const frame = frameLink.access().get()
			const x1 = (frame.x1 * mapSize) / mx
			const z1 = (frame.z1 * mapSize) / my
			const x2 = (frame.x2 * mapSize) / mx
			const z2 = (frame.z2 * mapSize) / my
			const ctx = canvasRef.current.getContext('2d')
			ctx.save()
			ctx.fillStyle = '#ccc'
			ctx.fillRect(0, 0, mapSize, mapSize)
			ctx.fillStyle = 'white'
			ctx.fillRect(x1, mapSize - z2, x2 - x1, z2 - z1)
			ctx.beginPath()
			ctx.arc(x, y, 2, 0, 2 * Math.PI, false)
			ctx.fillStyle = 'black'
			ctx.fill()
			ctx.restore()
		}
		if (canvasRef && canvasRef.current && colonistLink.value) updateCanvas()
	}, [frame])

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
					<canvas
						ref={canvasRef}
						width={mapSize}
						height={mapSize}
						style={{ position: 'absolute', right: 14, top: 14, width: '64px', height: '64px' }}></canvas>
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
