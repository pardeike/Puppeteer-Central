import React, { useEffect, createRef, useState } from 'react'
import { Form } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import commands from '../../commands'
import grid from '../../services/cmd_grid'
import gameinfo from '../../services/cmd_game-info'

const cellSize = 24
const cellSizeHalf = cellSize / 2
const cellSizeDelta = cellSizeHalf / 1.5
const alphas = [1, 0.5, 0.2, 0]

export default function ColonistCombat() {
	const gridLink = useStateLink(grid.ref)
	const scaleLink = useStateLink(grid.scaleRef)

	const canvasRef = createRef()
	const terrainColors = gameinfo.ref.access().nested.terrain.get()

	var array = gridLink.nested.val.value
	const len = Math.sqrt(array.length / 2)
	const size = len * cellSize
	const center = Math.floor(len / 2)

	useEffect(() => {
		commands.setGridSize(22 - scaleLink.value)
		return () => {
			commands.setGridSize(0)
		}
	}, [])

	useEffect(() => {
		const updateCanvas = async () => {
			const ctx = canvasRef.current.getContext('2d')
			ctx.save()
			ctx.fillStyle = 'black'
			ctx.fillRect(0, 0, size, size)
			for (let x = 0; x < len; x++)
				for (let z = 0; z < len; z++) {
					const n = (len - z - 1) * len + x
					const c1 = array[n * 2]
					const c2 = array[n * 2 + 1]
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
							if (x == center && z == center) ctx.fillStyle = 'blue'
							else {
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
		if (canvasRef && canvasRef.current) updateCanvas()

		return () => {}
	}, [array])

	return (
		<React.Fragment>
			<Form.Input
				style={{ width: '100%' }}
				min={0}
				max={18}
				name="Scale"
				onChange={(_, info) => {
					scaleLink.set(info.value)
					commands.setGridSize(22 - scaleLink.value)
				}}
				step={1}
				type="range"
				value={scaleLink.value}
			/>
			<canvas
				ref={canvasRef}
				width={size}
				height={size}
				style={{ cursor: 'pointer', width: '100%', height: '100%' }}
				onClick={(evt) => {
					var rect = canvasRef.current.getBoundingClientRect()
					const mx = (evt.clientX - rect.left) / rect.width
					const my = (evt.clientY - rect.top) / rect.height
					const dx = Math.floor(mx * len) - (len - 1) / 2
					const dz = Math.floor((1 - my) * len) - (len - 1) / 2
					const px = gridLink.nested.px.value
					const pz = gridLink.nested.pz.value
					commands.goto(px + dx, pz + dz)
				}}
			/>
		</React.Fragment>
	)
}
