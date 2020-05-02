import React, { useEffect, createRef, useState } from 'react'
import { useStateLink } from '@hookstate/core'
import commands from '../../commands'
import colonist from '../../services/cmd_colonist'
import grid from '../../services/cmd_grid'
import gameinfo from '../../services/cmd_game-info'
import TransformRecognizer from '../../services/transform-recogniser'
import delay from '../../services/delay'
import { Button, Container } from 'semantic-ui-react'

const cellSize = 24
const cellSizeHalf = cellSize / 2
const cellSizeDelta = cellSizeHalf / 1.5
const alphas = [1, 0.5, 0.2, 0]
let startDragX = 0
let startDragY = 0
let canvas = undefined
let canvasX = 0
let canvasY = 0
let canvasWidth = 0
let canvasHeight = 0

export default function ColonistCombat() {
	const colonistLink = useStateLink(colonist.ref)
	const gridLink = useStateLink(grid.ref)
	const frameLink = useStateLink(grid.frameRef)
	const [eventHandlerAdded, setEventHandlerAdded] = useState(false)
	const [autoFollow, setAutoFollow] = useState(true)

	const canvasRef = createRef()
	const terrainColors = gameinfo.ref.access().nested.terrain.get()

	const gridArray = gridLink.nested.val.value
	const px = gridLink.nested.px.value
	const pz = gridLink.nested.pz.value
	const gridCounter = gridLink.nested.counter.value
	const frame = frameLink.value
	console.log(`INIT FRAME= ${frame.x1},${frame.z1} - ${frame.x2},${frame.z2}`)

	let angle = undefined
	if (px < frame.x1 || px > frame.x2 || pz < frame.z1 || pz > frame.z2) {
		const ax = px - (frame.x1 + frame.x2) / 2
		const az = pz - (frame.z1 + frame.z2) / 2
		angle = Math.round((Math.atan2(-az, ax) * 180) / Math.PI)
	}

	const len = Math.sqrt(gridArray.length / 2)
	const size = len * cellSize

	const zoom = (val) => {
		const delta = 1000 - Math.abs(val) * 50
		delay.every('grid-draw', delta, () => {
			const old = frameLink.access().get()
			if (val <= -5 && old.x2 - old.x1 > 3 && old.z2 - old.z1 > 3) {
				// Zoom in
				const f = {
					x1: old.x1 + 1,
					z1: old.z1 + 1,
					x2: old.x2 - 1,
					z2: old.z2 - 1,
					inited: true,
				}
				console.log(`FRAME= ${f.x1},${f.z1} - ${f.x2},${f.z2}`)
				frameLink.access().set(f)
				commands.setGridPosition(f)
			}
			if (val >= 5 && old.x2 - old.x1 < 80 && old.z2 - old.z1 < 80) {
				// Zoom out
				const f = {
					x1: old.x1 - 1,
					z1: old.z1 - 1,
					x2: old.x2 + 1,
					z2: old.z2 + 1,
					inited: true,
				}
				console.log(`FRAME= ${f.x1},${f.z1} - ${f.x2},${f.z2}`)
				frameLink.access().set(f)
				commands.setGridPosition(f)
			}
		})
		return false
	}

	const move = (deltaX, deltaY) => {
		const cx = frame.inited ? canvasWidth / (frame.x2 - frame.x1) : 0
		const cy = frame.inited ? canvasHeight / (frame.z2 - frame.z1) : 0
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
		console.log(`FRAME= ${f.x1},${f.z1} - ${f.x2},${f.z2}`)
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
		canvas = canvasRef.current
		const cr = canvas.getBoundingClientRect()
		canvasX = cr.left
		canvasY = cr.top
		canvasWidth = cr.width
		canvasHeight = cr.height

		const updateCanvas = async () => {
			const ctx = canvas.getContext('2d')
			ctx.save()
			ctx.fillStyle = 'black'
			ctx.fillRect(0, 0, size, size)
			for (let x = 0; x < len; x++)
				for (let z = 0; z < len; z++) {
					const n = (len - z - 1) * len + x
					const c1 = gridArray[n * 2]
					const c2 = gridArray[n * 2 + 1]
					if (c1 != 255) {
						ctx.fillStyle = terrainColors[c1]
						ctx.fillRect(cellSize * x, cellSize * z, cellSize, cellSize)
						if (c2 & 1) {
							ctx.fillStyle = `rgba(0, 0, 0, ${alphas[(c2 & 6) / 2]})`
							const inset = c2 & 4 ? cellSize / 5 : 0
							ctx.fillRect(cellSize * x + inset, cellSize * z + inset, cellSize - 2 * inset, cellSize - 2 * inset)
						}
						if (c2 & 8) {
							ctx.beginPath()
							ctx.moveTo(cellSize * x + cellSizeHalf - cellSizeDelta, cellSize * z + cellSizeHalf)
							ctx.lineTo(cellSize * x + cellSizeHalf, cellSize * z + cellSizeHalf - cellSizeDelta)
							ctx.lineTo(cellSize * x + cellSizeHalf + cellSizeDelta, cellSize * z + cellSizeHalf)
							ctx.lineTo(cellSize * x + cellSizeHalf, cellSize * z + cellSizeHalf + cellSizeDelta)
							ctx.closePath()
							ctx.fillStyle = 'rgba(0,255,0,0.2)'
							ctx.fill()
						}
						if (c2 & 32) {
							ctx.beginPath()
							if (frame.x1 + x == px && frame.z1 + (len - 1 - z) == pz) {
								ctx.fillStyle = 'blue'
							} else {
								let co = 'white'
								if (c2 & 64) co = 'lightblue'
								if (c2 & 128) co = 'red'
								ctx.fillStyle = co
							}
							ctx.arc(cellSize * x + cellSizeHalf, cellSize * z + cellSizeHalf, cellSizeDelta, 0, 2 * Math.PI, false)
							ctx.fill()
						}
					}
				}
			ctx.restore()
		}

		updateCanvas()
		if (!eventHandlerAdded) {
			setEventHandlerAdded(true)
			canvas.addEventListener(
				'wheel',
				function (evt) {
					evt.preventDefault()
					zoom(evt.deltaY)
					return false
				},
				false
			)
			canvas.addEventListener('contextmenu', (evt) => {
				evt.preventDefault()

				const cr = canvas.getBoundingClientRect()
				canvasX = cr.left
				canvasY = cr.top
				canvasWidth = cr.width
				canvasHeight = cr.height

				const fx = (evt.clientX - canvasX) / canvasWidth
				const fz = 1 - (evt.clientY - canvasY) / canvasHeight
				const r = frame
				console.log('frame', r.x1, r.z1, r.x2, r.z2)
				const x = r.x1 + Math.floor((r.x2 - r.x1 + 1) * fx)
				const z = r.z1 + Math.floor((r.z2 - r.z1 + 1) * fz)
				console.log('%', fx * 100, fz * 100, x, z)
				commands.goto(x, z)
				return false
			})
			const recognizer = new TransformRecognizer(canvas)
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
	}, [gridCounter])

	const direction = {
		position: 'absolute',
		width: 'calc(50% - 10px)',
		height: 20,
		backgroundColor: 'clear',
		left: '50%',
		top: 'calc(50% - 10px)',
		transform: `rotate(${angle}deg)`,
		transformOrigin: 'left',
		pointerEvents: 'none',
	}
	const marker = {
		position: 'relative',
		left: `60%`,
		width: 20,
		height: 20,
		fontSize: 48,
		color: 'blue',
		borderRadius: '100%',
	}

	return (
		<React.Fragment>
			<Container style={{ paddingTop: 10, paddingBottom: 10, textAlign: 'right' }}>
				{colonistLink.value.drafted && (
					<Button size="mini" color="green" onClick={() => commands.setDraftModus(false)}>
						Undraft
					</Button>
				)}
				&nbsp;
				<Button size="mini" color="blue" disabled={autoFollow} onClick={() => setAutoFollow(true)}>
					Follow
				</Button>
			</Container>
			<canvas ref={canvasRef} width={size} height={size} style={{ cursor: 'pointer', width: '100%', height: '100%' }} />
			{angle !== undefined && (
				<div style={direction}>
					<div style={marker}>➜</div>
				</div>
			)}
		</React.Fragment>
	)
}
