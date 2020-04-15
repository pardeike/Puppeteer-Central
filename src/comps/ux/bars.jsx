import React from 'react'
import colors from '../../colors'

const miniIconStyle = {
	width: 16,
	height: 16,
	position: 'absolute',
	bottom: 4,
	right: 4,
	opacity: 0.25,
}

export function percentageBar(item, icon, treshold = 1) {
	const v = Math.floor((Math.min(treshold, item.percent) / treshold) * 255)
	return (
		<div
			style={{
				border: v == 255 ? '1px solid lightgray' : '',
				borderRadius: '3px',
				padding: '1px 8px 3px 8px',
				color: colors.bwContrast([255, v, v]),
				backgroundColor: `rgba(255, ${v}, ${v})`,
				position: 'relative',
			}}>
			{item.label}
			<img src={`/i/${icon}.png`} style={miniIconStyle} />
		</div>
	)
}

export function colorBar(item, icon) {
	return (
		<div
			style={{
				border: item.r + item.g + item.b == 3 * 255 ? '1px solid gray' : '',
				borderRadius: '3px',
				padding: '1px 8px 3px 8px',
				color: colors.bwContrast([item.r, item.g, item.b]),
				backgroundColor: `rgba(${item.r}, ${item.g}, ${item.b})`,
				position: 'relative',
			}}>
			{item.label}
			<img src={`/i/${icon}.png`} style={miniIconStyle} />
		</div>
	)
}

export function moodBar(need) {
	const style1 = { height: '20px', backgroundColor: '#eee', position: 'relative' }
	const style2 = { height: '100%', position: 'relative', backgroundColor: '#0cc', width: `${need.value}%` }
	const style3 = (th) => ({ position: 'absolute', left: `${Math.min(100, th)}%`, top: '50%', bottom: 0, width: '2px', backgroundColor: '#ddd' })
	const style4 = { height: '100%', position: 'absolute', top: 0, bottom: 0, right: 5 }
	const style5 = (m) => ({ position: 'absolute', left: `calc(${m}% - 7px)`, bottom: 0 })
	return (
		<div style={style1}>
			<div style={style2} />
			{need.treshholds.map((th, idx) => (
				<div key={idx} style={style3(th)}></div>
			))}
			<span style={style4}>{need.value}%</span>
			{need.marker >= 0 ? <img src="/i/marker.png" style={style5(need.marker)} /> : undefined}
		</div>
	)
}

export function skillBar(skill) {
	const progress = skill.progress ? (100.0 * skill.progress[0]) / skill.progress[1] : undefined
	const style1 = { height: '100%', position: 'relative', backgroundColor: '#00cd5d', width: `${skill.level * 5}%` }
	const style2 = { height: '100%', position: 'absolute', left: 0, height: 4, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', width: `${progress}%` }
	const style3 = { height: '100%', position: 'absolute', top: 0, bottom: 0, right: 5 }
	return (
		<div style={{ height: '20px', backgroundColor: '#eee', position: 'relative' }}>
			<div style={style1}>{progress ? <div style={style2} /> : undefined}</div>
			<span style={style3}>{skill.level}</span>
		</div>
	)
}
