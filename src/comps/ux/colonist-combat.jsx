import React, { useEffect, createRef, useState } from 'react'
import { Form, Menu, Popup } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import commands from '../../commands'
import game from '../../services/cmd_game-info'
import colonist from '../../services/cmd_colonist'
import grid from '../../services/cmd_grid'
import menu from '../../services/cmd_menu'
import TransformRecognizer from '../../services/transform-recogniser'
import delay from '../../services/delay'
import { Button } from 'semantic-ui-react'

let startDragX = 0
let startDragY = 0
let map = undefined
let mapX = 0
let mapY = 0
let mapWidth = 0
let mapHeight = 0

export default function ColonistCombat() {
	const gameLink = useStateLink(game.ref)
	const colonistLink = useStateLink(colonist.ref)
	const gridLink = useStateLink(grid.ref)
	const frameLink = useStateLink(grid.frameRef)
	const menuLink = useStateLink(menu.ref)
	const [eventHandlerAdded, setEventHandlerAdded] = useState(false)
	const [autoFollow, setAutoFollow] = useState(true)

	let mapFrequency = gameLink.value.mapFreq
	if (mapFrequency == 0) mapFrequency = 400

	const mapRef = createRef()
	const [mapURL, setMapURL] = useState('')
	const [mapRefresh, setMapRefresh] = useState(0)
	grid.setMapUpdateCallback((url) => {
		setMapURL(url)
		setTimeout(() => {
			setMapRefresh(mapRefresh + 1)
			commands.requestGridUpdate(frameLink.value)
		}, mapFrequency)
	})

	const px = gridLink.nested.px.value
	const pz = gridLink.nested.pz.value
	const phx = gridLink.nested.phx.value
	const phz = gridLink.nested.phz.value
	const frame = frameLink.value

	let angle = undefined
	let position = undefined
	if (px < frame.x1 || px > frame.x2 || pz < frame.z1 || pz > frame.z2) {
		const ax = px - (frame.x1 + frame.x2) / 2
		const az = pz - (frame.z1 + frame.z2) / 2
		angle = Math.round((Math.atan2(-az, ax) * 180) / Math.PI)
	} else {
		position = {
			x: Math.floor((100 * (phx - frame.x1)) / (frame.x2 - frame.x1 + 1)),
			z: 99 - Math.floor((100 * (phz - frame.z1)) / (frame.z2 - frame.z1 + 1)),
		}
	}

	const init = () => {
		const x = colonistLink.value.x
		const y = colonistLink.value.y
		const f = {
			x1: x - 3,
			z1: y - 3,
			x2: x + 3,
			z2: y + 3,
		}
		frameLink.access().set(f)
		return f
	}

	const zoom = (val) => {
		const delta = 1000 - Math.abs(val) * 50
		delay.every('grid-draw', delta, () => {
			const old = frameLink.access().get()
			if (val >= 5 && old.x2 - old.x1 < 80 && old.z2 - old.z1 < 80) {
				const f = {
					x1: old.x1 - 1,
					z1: old.z1 - 1,
					x2: old.x2 + 1,
					z2: old.z2 + 1,
				}
				frameLink.access().set(f)
			}
			if (val <= -5 && old.x2 - old.x1 > 2 && old.z2 - old.z1 > 2) {
				const f = {
					x1: old.x1 + 1,
					z1: old.z1 + 1,
					x2: old.x2 - 1,
					z2: old.z2 - 1,
				}
				frameLink.access().set(f)
			}
		})
		return false
	}

	const move = (deltaX, deltaY) => {
		const cx = frame.x2 != frame.x1 ? mapWidth / (frame.x2 - frame.x1) : 0
		const cy = frame.z2 != frame.z1 ? mapHeight / (frame.z2 - frame.z1) : 0
		const x = deltaX / (cx + 1)
		const y = deltaY / (cy + 1)
		const dx = Math.round(x - startDragX)
		const dy = Math.round(y - startDragY)
		if (dx != 0 || dy != 0) {
			setAutoFollow(false)
			startDragX = x
			startDragY = y
			moveGrid(dx, dy)
		}
		return false
	}

	const contextMenu = (map, cx, cy, shift) => {
		const cr = map.getBoundingClientRect()
		mapX = cr.left
		mapY = cr.top
		mapWidth = cr.width
		mapHeight = cr.height

		const fx = (cx - mapX) / mapWidth
		const fz = 1 - (cy - mapY) / mapHeight
		const r = frame
		const x = r.x1 + Math.floor((r.x2 - r.x1 + 1) * fx)
		const z = r.z1 + Math.floor((r.z2 - r.z1 + 1) * fz)

		if (shift) commands.goto(x, z)
		else commands.menu(x, z)
	}

	const moveGrid = (dx, dy) => {
		const f = {
			x1: frameLink.nested.x1.value - dx,
			z1: frameLink.nested.z1.value + dy,
			x2: frameLink.nested.x2.value - dx,
			z2: frameLink.nested.z2.value + dy,
		}
		frameLink.access().set(f)
	}

	useEffect(() => {
		setTimeout(() => commands.requestGridUpdate(init()), 0)
		return () => {
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

		if (autoFollow && frameLink.nested.x2.value != frameLink.nested.x1.value && frameLink.nested.z2.value != frameLink.nested.z1.value) {
			let n = 0
			n = 1 + Math.floor(Math.abs(frameLink.nested.x2.value - frameLink.nested.x1.value) / 8)
			if (px - n < frameLink.nested.x1.value) moveGrid(frameLink.nested.x1.value - (px - n), 0)
			if (px + n > frameLink.nested.x2.value) moveGrid(frameLink.nested.x2.value - (px + n), 0)
			n = 1 + Math.floor(Math.abs(frameLink.nested.z2.value - frameLink.nested.z1.value) / 8)
			if (pz - n < frameLink.nested.z1.value) moveGrid(0, pz - n - frameLink.nested.z1.value)
			if (pz + n > frameLink.nested.z2.value) moveGrid(0, pz + n - frameLink.nested.z2.value)
		}

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
	}, [mapURL])

	const dz = frame.z2 - frame.z1
	const markerSize = dz == 0 ? 0 : mapHeight / (frame.z2 - frame.z1) / 1.5

	const markerBase = {
		position: 'absolute',
		width: '50%',
		height: `${Math.floor(markerSize * 2)}px`,
		left: '50%',
		top: `calc(50% - ${Math.floor(markerSize)}px)`,
		transform: `rotate(${angle}deg)`,
		transformOrigin: 'left',
		display: 'flex',
		flexDirection: 'row-reverse',
		alignItems: 'center',
		itemAlign: 'right',
		pointerEvents: 'none',
	}
	const markerItem = {
		position: 'relative',
		color: 'rgb(0,100,255)',
		fontSize: markerSize * 2,
		pointerEvents: 'none',
		opacity: 0.5,
	}
	const circle = (pos) => ({
		position: 'absolute',
		width: `${Math.floor(markerSize * 2)}px`,
		height: `${Math.floor(markerSize * 2)}px`,
		left: `${pos.x}%`,
		top: `${pos.z}%`,
		transform: 'translate(-50%, -50%)',
		transformOrigin: 'left',
		border: `${markerSize / 5}px solid rgb(0, 100,255)`,
		textAlign: 'center',
		borderRadius: '100%',
		pointerEvents: 'none',
		opacity: 0.5,
	})

	const getMenuOptions = () => {
		return menuLink.value.map((choice) => ({
			key: choice.id,
			disabled: choice.disabled,
			content: choice.label,
			value: choice.id,
		}))
	}

	let scale = Math.max(80 - 2 - Math.max(frameLink.value.x2 - frameLink.value.x1 - 2, 80 - 2 - frameLink.value.z2 - frameLink.value.z1 - 2)) / 78
	scale = scale * scale * scale
	return (
		<React.Fragment>
			<div
				style={{
					paddingTop: 10,
					paddingBottom: 10,
					display: 'grid',
					columnGap: '10px',
					gridTemplateColumns: 'minmax(25%, auto) min-content min-content',
				}}>
				<Form.Input
					min={0}
					max={1}
					name="Scale"
					onChange={(_, info) => {
						const n = 41 - Math.round(40 * Math.cbrt(info.value))
						const old = frameLink.access().get()
						const cx = (old.x1 + old.x2) / 2
						const cz = (old.z1 + old.z2) / 2
						const f = {
							x1: cx - n,
							z1: cz - n,
							x2: cx + n,
							z2: cz + n,
						}
						frameLink.access().set(f)
					}}
					step={0.01}
					type="range"
					style={{ width: '100%' }}
					value={scale}
				/>
				<Button
					size="mini"
					color={colonistLink.value.drafted ? 'red' : 'green'}
					onClick={() => {
						commands.setDraftModus(!colonistLink.value.drafted)
					}}>
					{colonistLink.value.drafted ? 'Undraft' : 'Draft'}
				</Button>
				<Button size="mini" color="blue" disabled={autoFollow} onClick={() => setAutoFollow(true)}>
					Follow
				</Button>
			</div>
			<div style={{ position: 'relative', lineHeight: 0 }}>
				{mapURL && <img ref={mapRef} draggable={false} src={mapURL} style={{ userSelect: 'none', cursor: 'pointer', width: '100%', height: '100%' }} />}
				{angle !== undefined && (
					<div style={markerBase}>
						<div style={markerItem}>➜</div>
					</div>
				)}
				{position !== undefined && <div style={circle(position)} />}
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
