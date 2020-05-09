import React, { useEffect, createRef, useState } from 'react'
import { Form, Menu, Popup } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import commands from '../../commands'
import game from '../../services/cmd_game-info'
import colonist from '../../services/cmd_colonist'
import grid from '../../services/cmd_grid'
import menu from '../../services/cmd_menu'
import selection from '../../services/cmd_selection'
import TransformRecognizer from '../../services/transform-recogniser'
import delay from '../../services/delay'
import { Button } from 'semantic-ui-react'
import GameMap from './game-map'

let startDragX = 0
let startDragY = 0
let map = undefined
let mapWidth = 0
let mapHeight = 0
let newFrame = { x1: -1, z1: -1, x2: -1, z2: -1 }
let mapTimer = undefined
//let debugState = []

export default function ColonistCombat() {
	const gameLink = useStateLink(game.ref)
	const isDraftedLink = useStateLink(colonist.isDraftedRef)
	const gridLink = useStateLink(grid.ref)
	const menuLink = useStateLink(menu.ref)
	const selectionLink = useStateLink(selection.ref)
	const [eventHandlerAdded, setEventHandlerAdded] = useState(false)
	const [autoFollow, setAutoFollow] = useState(true)
	const [popupCoordinates, setPopupCoordinates] = useState({ x: -1, y: -1 })
	const [newFrameTrigger, setNewFrameTrigger] = useState({})

	let mapFrequency = gameLink.value.mapFreq
	if (mapFrequency == 0) mapFrequency = 400

	const mapRef = createRef()
	const [mapURL, setMapURL] = useState('')
	const [mapRefresh, setMapRefresh] = useState(0)
	grid.setMapUpdateCallback((url, frm) => {
		setMapURL(url)
		newFrame = frm
		setNewFrameTrigger(frm)
		mapTimer = setTimeout(() => {
			setMapRefresh(mapRefresh + 1)
			follow()
			commands.requestGridUpdate(newFrame)
		}, mapFrequency)
	})
	useEffect(() => {
		commands.requestGridUpdate(undefined)
		return () => {
			clearTimeout(mapTimer)
			grid.setMapUpdateCallback(undefined)
		}
	}, [])

	const popupAnchorRef = createRef()

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
				setNewFrameTrigger(newFrame)
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
			setNewFrameTrigger(newFrame)
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
		setNewFrameTrigger(newFrame)
	}

	const relativeCoordinates = (map, cx, cy) => {
		const cr = map.getBoundingClientRect()
		const fx = cx / cr.width
		const fz = 1 - cy / cr.height
		const f = gridLink.value.frame
		const x = f.x1 + Math.floor((f.x2 - f.x1 + 1) * fx)
		const z = f.z1 + Math.floor((f.z2 - f.z1 + 1) * fz)
		return { x, z }
	}

	const select = (map, cx, cy) => {
		const coord = relativeCoordinates(map, cx, cy)
		commands.gizmos(coord.x, coord.z)
	}

	const contextMenu = (map, cx, cy, shift) => {
		setPopupCoordinates({ x: cx, y: cy })
		const coord = relativeCoordinates(map, cx, cy)
		if (shift) commands.goto(coord.x, coord.z)
		else commands.menu(coord.x, coord.z)
	}

	/*const addDebugState = (state) => {
		debugState.unshift(state)
		for (var i = debugState.length - 1; i > 0; i--) if (debugState[i] == 'stop') debugState.splice(i)
	}

	const showDebugState = (
		<div>
			{debugState.map((ds) => (
				<span style={{ backgroundColor: '#eee', padding: 4, marginRight: 2 }}>{ds}</span>
			))}
		</div>
	)*/

	useEffect(() => {
		map = mapRef.current
		if (!map) return
		const cr = map.getBoundingClientRect()
		mapWidth = cr.width
		mapHeight = cr.height

		if (!eventHandlerAdded) {
			setEventHandlerAdded(true)
			const recognizer = new TransformRecognizer(map /*, addDebugState*/)
			recognizer.onEvent('scale', (e) => {
				zoom((e.scale - 1) * -20)
			})
			recognizer.onEvent('move', (e) => {
				move(e.x, e.y)
			})
			recognizer.onEvent('short', (e) => {
				if (e.btn == 0) select(map, e.x, e.y)
				else if (e.btn == 2) contextMenu(map, e.x, e.y, e.shift)
				menuLink.access().set([])
			})
			recognizer.onEvent('long', (e) => {
				contextMenu(map, e.x, e.y, false)
				menuLink.access().set([])
			})
			recognizer.onEvent('wheel', (e) => {
				zoom(e.y)
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

	const doGizmo = (gizmo) => {
		if (gizmo.disabled) return
		if (!gizmo.allowed) return
		commands.gizmo(gizmo.id)
		selection.reset()
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

	const gizmoStyle = (g) => ({
		cursor: g.allowed ? (g.disabled ? 'default' : 'pointer') : 'not-allowed',
		width: gizmoSize,
		height: gizmoSize,
		position: 'relative',
		overflow: 'hidden',
		opacity: g.allowed ? 1 : 0.5,
	})

	const gizmoSize = 50

	return (
		<React.Fragment>
			<div style={topGrid}>
				<Form.Input min={0} max={1} name="Scale" onChange={slider} step={0.01} type="range" style={{ width: '100%' }} value={scale} />
				<Button size="mini" color={isDraftedLink.value ? 'red' : 'green'} onClick={() => commands.setDraftModus(!isDraftedLink.value)}>
					{isDraftedLink.value ? 'Undraft' : 'Draft'}
				</Button>
				<Button size="mini" color="blue" disabled={autoFollow} onClick={() => setAutoFollow(true)}>
					Follow
				</Button>
			</div>
			<div style={{ position: 'relative', lineHeight: 0 }}>
				<div ref={popupAnchorRef} style={{ position: 'absolute', left: popupCoordinates.x, top: popupCoordinates.y, width: 0, height: 0 }} />
				<GameMap mapURL={mapURL} mapRef={mapRef} newFrame={newFrameTrigger} selection={selectionLink.access().nested.frame.get()} />
			</div>
			<Popup context={popupAnchorRef} flowing pinned size="mini" onClose={() => menuLink.access().set([])} open={menuLink.value.length > 0}>
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
			<div style={{ display: 'grid', gridColumnGap: 8, gridTemplateColumns: `repeat(auto-fill, ${gizmoSize}px)` }}>
				{selectionLink.nested.gizmos.value.map((gizmo, i) => {
					return (
						<div key={gizmo.id} style={{ paddingTop: '10px' }}>
							<Popup
								flowing
								pinned
								size="mini"
								content={gizmo.disabled}
								disabled={!gizmo.disabled}
								trigger={
									<div style={gizmoStyle(gizmo)} onClick={() => doGizmo(gizmo)}>
										<img
											src={selectionLink.nested.atlasURL.value}
											height={gizmoSize}
											style={{ position: 'relative', left: i * -gizmoSize, top: 0 }}
										/>
									</div>
								}
							/>
							<div style={{ textAlign: 'center', fontSize: '0.6em', lineHeight: '1.1em' }}>{gizmo.label}</div>
						</div>
					)
				})}
			</div>
		</React.Fragment>
	)
}
