import React, { useEffect, useState } from 'react'
import { useStateLink } from '@hookstate/core'
import grid from '../../services/cmd_grid'

let mapHeight = 0

export default function GameMap(props) {
	const gridLink = useStateLink(grid.ref)

	const g = gridLink.value
	const px = g.px
	const pz = g.pz
	const phx = g.phx
	const phz = g.phz
	const frame = g.frame

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

	const newFrame = props.newFrame
	let newAngle = undefined
	let newPosition = undefined
	if (newFrame != frame) {
		if (px < newFrame.x1 || px > newFrame.x2 || pz < newFrame.z1 || pz > newFrame.z2) {
			const ax = px - (newFrame.x1 + newFrame.x2) / 2
			const az = pz - (newFrame.z1 + newFrame.z2) / 2
			newAngle = Math.round((Math.atan2(-az, ax) * 180) / Math.PI)
		} else {
			newPosition = {
				x: Math.floor((100 * (phx - newFrame.x1)) / (newFrame.x2 - newFrame.x1 + 1)),
				z: 99 - Math.floor((100 * (phz - newFrame.z1)) / (newFrame.z2 - newFrame.z1 + 1)),
			}
		}
	}

	useEffect(() => {
		const map = props.mapRef.current
		if (!map) return
		const cr = map.getBoundingClientRect()
		mapHeight = cr.height
	}, [props.mapURL])

	const markerSize = frame.z2 == frame.z1 ? 0 : mapHeight / (frame.z2 - frame.z1) / 1.5
	const newMarkerSize = newFrame.z2 == newFrame.z1 ? 0 : mapHeight / (newFrame.z2 - newFrame.z1) / 1.5

	const markerBase = (ms, ang) => ({
		position: 'absolute',
		width: '50%',
		height: `${Math.floor(ms * 2)}px`,
		left: '50%',
		top: `calc(50% - ${Math.floor(ms)}px)`,
		transform: `rotate(${ang}deg)`,
		transformOrigin: 'left',
		display: 'flex',
		flexDirection: 'row-reverse',
		alignItems: 'center',
		itemAlign: 'right',
		pointerEvents: 'none',
	})

	const markerItem = (ms, op) => ({
		position: 'relative',
		color: 'rgb(0,100,255)',
		fontSize: ms * 2,
		pointerEvents: 'none',
		opacity: op,
	})

	const circle = (p, ms, op) => ({
		position: 'absolute',
		width: `${Math.floor(ms * 2)}px`,
		height: `${Math.floor(ms * 2)}px`,
		left: `${p.x}%`,
		top: `${p.z}%`,
		transform: 'translate(-50%, -50%)',
		transformOrigin: 'left',
		border: `${ms / 5}px solid rgb(0, 100,255)`,
		textAlign: 'center',
		borderRadius: '100%',
		pointerEvents: 'none',
		opacity: op,
	})

	return (
		<React.Fragment>
			{props.mapURL && (
				<img ref={props.mapRef} draggable={false} src={props.mapURL} style={{ userSelect: 'none', cursor: 'pointer', width: '100%', height: '100%' }} />
			)}
			{angle && (
				<div style={markerBase(markerSize, angle)}>
					<div style={markerItem(markerSize, 0.6)}>➜</div>
				</div>
			)}
			{position && <div style={circle(position, markerSize, 0.6)} />}
			{newAngle && newAngle != angle && (
				<div style={markerBase(newMarkerSize, newAngle)}>
					<div style={markerItem(newMarkerSize, 0.2)}>➜</div>
				</div>
			)}
			{newPosition && newPosition != position && <div style={circle(newPosition, newMarkerSize, 0.2)} />}
		</React.Fragment>
	)
}
