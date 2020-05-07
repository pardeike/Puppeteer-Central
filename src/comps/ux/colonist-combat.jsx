import React, { useEffect, createRef, useState } from 'react'
import { Form, Menu, Popup } from 'semantic-ui-react'
import { useStateLink, createStateLink } from '@hookstate/core'
import commands from '../../commands'
import game from '../../services/cmd_game-info'
import colonist from '../../services/cmd_colonist'
import grid from '../../services/cmd_grid'
import menu from '../../services/cmd_menu'
import TransformRecognizer from '../../services/transform-recogniser'
import delay from '../../services/delay'
import { Button } from 'semantic-ui-react'
import GameMap from './game-map'

let startDragX = 0
let startDragY = 0
let map = undefined
let mapX = 0
let mapY = 0
let mapWidth = 0
let mapHeight = 0
let newFrame = { x1: -1, z1: -1, x2: -1, z2: -1 }
let mapTimer = undefined

export default function ColonistCombat() {
	const gameLink = useStateLink(game.ref)
	const colonistLink = useStateLink(colonist.ref)
	const gridLink = useStateLink(grid.ref)
	const menuLink = useStateLink(menu.ref)
	const [eventHandlerAdded, setEventHandlerAdded] = useState(false)
	const [autoFollow, setAutoFollow] = useState(true)

	let mapFrequency = gameLink.value.mapFreq
	if (mapFrequency == 0) mapFrequency = 400

	const mapRef = createRef()
	const [mapURL, setMapURL] = useState('')
	const [mapRefresh, setMapRefresh] = useState(0)
	grid.setMapUpdateCallback((url, frm) => {
		setMapURL(url)
		newFrame = frm
		mapTimer = setTimeout(() => {
			setMapRefresh(mapRefresh + 1)
			follow()
			commands.requestGridUpdate(newFrame)
		}, mapFrequency)
	})

	const zoom = (val) => {
		const delta = 1000 - Math.abs(val) * 50
		delay.every('grid-draw', delta, () => {
			let dir = 0
			const f = gridLink.value.frame
			let scale = (Math.max(2, Math.min(80, f.x2 - f.x1, f.z2 - f.z1)) - 2) / (80 - 2)
			if (val >= 5 * scale && newFrame.x2 - newFrame.x1 < 80 && newFrame.z2 - newFrame.z1 < 80) dir = -1
			if (val <= -5 * scale && newFrame.x2 - newFrame.x1 > 2 && newFrame.z2 - newFrame.z1 > 2) dir = 1
			if (dir != 0) {
				newFrame = {
					x1: newFrame.x1 + dir,
					z1: newFrame.z1 + dir,
					x2: newFrame.x2 - dir,
					z2: newFrame.z2 - dir,
				}
			}
		})
		return false
	}

	const move = (deltaX, deltaY) => {
		const f = gridLink.value.frame
		const cx = f.x2 != f.x1 ? mapWidth / (f.x2 - f.x1) : 0
		const cy = f.z2 != f.z1 ? mapHeight / (f.z2 - f.z1) : 0
		const x = deltaX / (cx + 1)
		const y = deltaY / (cy + 1)
		const dx = Math.round(x - startDragX)
		const dy = Math.round(y - startDragY)
		if (dx != 0 || dy != 0) {
			setAutoFollow(false)
			startDragX = x
			startDragY = y
			newFrame = {
				x1: newFrame.x1 - dx,
				z1: newFrame.z1 + dy,
				x2: newFrame.x2 - dx,
				z2: newFrame.z2 + dy,
			}
		}
		return false
	}

	const follow = () => {
		const px = gridLink.value.px
		const pz = gridLink.value.pz
		if (autoFollow && newFrame.x2 != newFrame.x1 && newFrame.z2 != newFrame.z1) {
			let n = 0
			let d = 0
			n = 1 + Math.floor(Math.abs(newFrame.x2 - newFrame.x1) / 8)
			d = px - n - newFrame.x1
			if (d < 0) {
				newFrame.x1 += d
				newFrame.x2 += d
			}
			d = px + n - newFrame.x2
			if (d > 0) {
				newFrame.x1 += d
				newFrame.x2 += d
			}
			n = 1 + Math.floor(Math.abs(newFrame.z2 - newFrame.z1) / 8)
			d = pz - n - newFrame.z1
			if (d < 0) {
				newFrame.z1 += d
				newFrame.z2 += d
			}
			d = pz + n - newFrame.z2
			if (d > 0) {
				newFrame.z1 += d
				newFrame.z2 += d
			}
		}
	}

	const slider = (_, info) => {
		const n = 41 - Math.round(40 * Math.cbrt(info.value))
		const frame = gridLink.value.frame
		const cx = (frame.x1 + frame.x2) / 2
		const cz = (frame.z1 + frame.z2) / 2
		newFrame = {
			x1: cx - n,
			z1: cz - n,
			x2: cx + n,
			z2: cz + n,
		}
	}

	const contextMenu = (map, cx, cy, shift) => {
		const cr = map.getBoundingClientRect()
		mapX = cr.left
		mapY = cr.top
		mapWidth = cr.width
		mapHeight = cr.height

		const fx = (cx - mapX) / mapWidth
		const fz = 1 - (cy - mapY) / mapHeight
		const f = gridLink.value.frame
		const x = f.x1 + Math.floor((f.x2 - f.x1 + 1) * fx)
		const z = f.z1 + Math.floor((f.z2 - f.z1 + 1) * fz)

		if (shift) commands.goto(x, z)
		else commands.menu(x, z)
	}

	useEffect(() => {
		setTimeout(() => commands.requestGridUpdate(undefined), 0)
		return () => {
			clearTimeout(mapTimer)
			grid.setMapUpdateCallback(undefined)
		}
	}, [])

	useEffect(() => {
		map = mapRef.current
		if (!map) return
		const cr = map.getBoundingClientRect()
		mapX = cr.left
		mapY = cr.top
		mapWidth = cr.width
		mapHeight = cr.height

		if (!eventHandlerAdded) {
			setEventHandlerAdded(true)
			const recognizer = new TransformRecognizer(map)
			recognizer.onEvent('scale', (e) => {
				zoom((e.scale - 1) * -20)
			})
			recognizer.onEvent('move', (e) => {
				move(e.x, e.y)
			})
			recognizer.onEvent('long', (e) => {
				contextMenu(map, e.x, e.y, false)
			})
			recognizer.onEvent('wheel', (e) => {
				zoom(e.y)
			})
			recognizer.onEvent('context', (e) => {
				contextMenu(map, e.x, e.y, e.shift)
			})
			recognizer.onEvent('stop', () => {
				startDragX = 0
				startDragY = 0
			})
		}

		return () => {}
	}, [mapURL, newFrame])

	const getMenuOptions = () => {
		return menuLink.value.map((choice) => ({
			key: choice.id,
			disabled: choice.disabled,
			content: choice.label,
			value: choice.id,
		}))
	}

	const f = gridLink.value.frame
	let scale = 1 - (Math.max(2, Math.min(80, f.x2 - f.x1, f.z2 - f.z1)) - 2) / (80 - 2)
	scale = scale * scale * scale

	const topGrid = {
		paddingTop: 10,
		paddingBottom: 10,
		display: 'grid',
		columnGap: '10px',
		gridTemplateColumns: 'minmax(25%, auto) min-content min-content',
	}

	return (
		<React.Fragment>
			<div style={topGrid}>
				<Form.Input min={0} max={1} name="Scale" onChange={slider} step={0.01} type="range" style={{ width: '100%' }} value={scale} />
				<Button size="mini" color={colonistLink.value.drafted ? 'red' : 'green'} onClick={() => commands.setDraftModus(!colonistLink.value.drafted)}>
					{colonistLink.value.drafted ? 'Undraft' : 'Draft'}
				</Button>
				<Button size="mini" color="blue" disabled={autoFollow} onClick={() => setAutoFollow(true)}>
					Follow
				</Button>
			</div>
			<div style={{ position: 'relative', lineHeight: 0 }}>
				<GameMap mapURL={mapURL} mapRef={mapRef} newFrame={newFrame} />
			</div>
			<Popup context={mapRef} flowing={true} size="mini" position="bottom left" onClose={() => menuLink.access().set([])} open={menuLink.value.length > 0}>
				<Menu
					items={getMenuOptions()}
					onItemClick={(_e, data) => {
						commands.action(data.value)
						menuLink.access().set([])
					}}
					size="mini"
					fluid
					compact
					secondary
					vertical
				/>
			</Popup>
		</React.Fragment>
	)
}
