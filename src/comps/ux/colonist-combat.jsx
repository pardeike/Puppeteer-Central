import React, { useEffect, createRef, useState } from 'react'
import { Form, Menu, Popup } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import commands from '../../commands'
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
	const colonistLink = useStateLink(colonist.ref)
	const gridLink = useStateLink(grid.ref)
	const mapDataURLLink = useStateLink(grid.mapDataURLRef)
	const frameLink = useStateLink(grid.frameRef)
	const menuLink = useStateLink(menu.ref)
	const [eventHandlerAdded, setEventHandlerAdded] = useState(false)
	const [autoFollow, setAutoFollow] = useState(true)

	const mapRef = createRef()

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
					inited: true,
				}
				frameLink.access().set(f)
				commands.setGridPosition(f)
			}
			if (val <= -5 && old.x2 - old.x1 > 2 && old.z2 - old.z1 > 2) {
				const f = {
					x1: old.x1 + 1,
					z1: old.z1 + 1,
					x2: old.x2 - 1,
					z2: old.z2 - 1,
					inited: true,
				}
				frameLink.access().set(f)
				commands.setGridPosition(f)
			}
		})
		return false
	}

	const move = (deltaX, deltaY) => {
		const cx = frame.inited ? mapWidth / (frame.x2 - frame.x1) : 0
		const cy = frame.inited ? mapHeight / (frame.z2 - frame.z1) : 0
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

	const moveGrid = (dx, dy) => {
		const f = {
			x1: frameLink.nested.x1.value - dx,
			z1: frameLink.nested.z1.value + dy,
			x2: frameLink.nested.x2.value - dx,
			z2: frameLink.nested.z2.value + dy,
			inited: true,
		}
		frameLink.access().set(f)
		commands.setGridPosition(f)
	}

	if (autoFollow && frame.inited) {
		let n = 0
		n = Math.floor((frame.x2 - frame.x1) / 8)
		if (px - n < frame.x1) moveGrid(1, 0)
		if (px + n > frame.x2) moveGrid(-1, 0)
		n = Math.floor((frame.z2 - frame.z1) / 8)
		if (pz - n < frame.z1) moveGrid(0, -1)
		if (pz + n > frame.z2) moveGrid(0, 1)
	}

	useEffect(() => {
		if (!frame.inited) {
			commands.requestGrid()
		}
		return () => {}
	}, [])

	useEffect(() => {
		map = mapRef.current
		const cr = map.getBoundingClientRect()
		mapX = cr.left
		mapY = cr.top
		mapWidth = cr.width
		mapHeight = cr.height

		if (!eventHandlerAdded) {
			setEventHandlerAdded(true)
			map.addEventListener(
				'wheel',
				function (evt) {
					evt.preventDefault()
					zoom(evt.deltaY)
					return false
				},
				false
			)
			map.addEventListener('contextmenu', (evt) => {
				evt.preventDefault()

				const cr = map.getBoundingClientRect()
				mapX = cr.left
				mapY = cr.top
				mapWidth = cr.width
				mapHeight = cr.height

				const fx = (evt.clientX - mapX) / mapWidth
				const fz = 1 - (evt.clientY - mapY) / mapHeight
				const r = frame
				const x = r.x1 + Math.floor((r.x2 - r.x1 + 1) * fx)
				const z = r.z1 + Math.floor((r.z2 - r.z1 + 1) * fz)

				if (evt.shiftKey) commands.goto(x, z)
				else commands.menu(x, z)

				return false
			})
			const recognizer = new TransformRecognizer(map)
			recognizer.onScale((evt) => {
				//
			})
			recognizer.onMove((evt) => {
				move(evt.x, evt.y)
			})
			recognizer.onStop(() => {
				startDragX = 0
				startDragY = 0
			})
		}

		return () => {}
	}, [mapDataURLLink.value])

	const markerSize = mapHeight / (frame.z2 - frame.z1) / 1.5

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
							inited: true,
						}
						frameLink.access().set(f)
						commands.setGridPosition(f)
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
				<img ref={mapRef} draggable={false} src={mapDataURLLink.value} style={{ userSelect: 'none', cursor: 'pointer', width: '100%', height: '100%' }} />
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
					fitted
				/>
			</Popup>
		</React.Fragment>
	)
}
