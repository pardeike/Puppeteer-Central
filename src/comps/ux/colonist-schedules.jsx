import React, { useState } from 'react'
import { useStateLink } from '@hookstate/core'
import state from '../../services/cmd_state'
import colors from '../../colors'
import commands from '../../commands'
import game from '../../services/cmd_game-info'
import { Button } from 'semantic-ui-react'

export default function ColonisSchedules() {
	const gameLink = useStateLink(game.ref)
	const stateLink = useStateLink(state.ref)
	const [scheduleType, setScheduleType] = useState('A')

	const prios = stateLink.value.priorities
	const sched = stateLink.value.schedules

	const baseWidth = 20

	const grid1 = {
		paddingTop: '14px',
		paddingBottom: '4px',
		display: 'grid',
		gridColumnGap: '2px',
		gridRowGap: '2px',
		gridTemplateColumns: `auto 4px repeat(${prios.columns.length}, auto)`,
		textAlign: 'center',
		fontSize: '0.8em',
		overflowX: 'auto',
	}

	const grid2 = {
		paddingTop: '14px',
		paddingBottom: '4px',
		display: 'grid',
		gridColumnGap: '2px',
		gridRowGap: '2px',
		gridTemplateColumns: 'auto 4px repeat(24, auto)',
		textAlign: 'center',
		fontSize: '0.8em',
		overflowX: 'auto',
	}

	const header1 = {
		writingMode: 'vertical-lr',
		transform: 'rotate(180deg)',
		textAlign: 'left',
		width: baseWidth,
		lineHeight: '1em',
		paddingLeft: '6px',
		paddingTop: '4px',
	}

	const header2 = {
		textAlign: 'center',
		width: baseWidth,
		paddingBottom: '4px',
	}

	const labelStyle = {
		textAlign: 'left',
		whiteSpace: 'nowrap',
		lineHeight: '1.5em',
	}

	var scheduleTypes = ['A', 'W', /*'M',*/ 'J', 'S']
	if (gameLink.value.features.indexOf('royalty') > -1) scheduleTypes.splice(2, 0, 'M')

	const prioColors = ['transparent', '#ddd', '#0c0', '#bb0', '#e81', '#888']
	const schedColors = {
		A: [150, 150, 150],
		W: [136, 136, 33],
		M: [85, 185, 85],
		J: [122, 65, 156],
		S: [60, 60, 220],
	}
	const schedNames = {
		A: 'Anything',
		W: 'Work',
		M: 'Meditate',
		J: 'Recreation',
		S: 'Sleep',
	}
	const check = <img src="/i/check.png" style={{ width: '100%', height: '100%' }} />

	const prioClick = (row, ri, i, isRightClick) => {
		if (row.yours && row.val[i] >= 0) {
			const oldVal = row.val[i] % 100
			const passion = Math.floor(row.val[i] / 100)
			const nextValue = isRightClick ? oldVal + 1 : oldVal - 1 + prios.max
			const newVal = prios.manual ? nextValue % prios.max : oldVal > 0 ? 0 : prios.norm
			const n1 = stateLink.nested.priorities.nested.rows.nested
			const n2 = n1[ri].nested.val.nested
			n2[i].set(newVal + 100 * passion)
			commands.tickPriority(i, newVal)
		}
	}

	const prioBox = (val, ri, i, row) => {
		var v = val % 100
		var p = Math.floor(val / 100)
		const style1 = {
			width: baseWidth,
			height: baseWidth,
			backgroundColor: prioColors[Math.min(5, v + 1)],
			color: 'black',
			fontSize: '1.25em',
			lineHeight: '1.4em',
			position: 'relative',
			opacity: row.yours ? 1 : 0.3,
			cursor: row.yours && p >= 0 ? 'pointer' : undefined,
		}
		const style2 = {
			position: 'absolute',
			bottom: 0,
			right: 0,
			width: 10,
			height: 10,
		}
		return (
			<span
				key={i}
				style={style1}
				onClick={(e) => {
					e.preventDefault()
					prioClick(row, ri, i, false)
				}}
				onContextMenu={(e) => {
					e.preventDefault()
					prioClick(row, ri, i, true)
				}}>
				{p > 0 ? <img src={`/i/passion${p}.png`} style={style2} /> : undefined}
				<span className="bolder" style={{ userSelect: 'none', position: 'absolute', left: 0, top: 0, bottom: 0, right: 0 }}>
					{v > 0 ? (prios.manual ? v : check) : ''}
				</span>
			</span>
		)
	}

	const schedClick = (row, ri, i, isRightClick) => {
		if (row.yours) {
			const n1 = stateLink.nested.schedules.nested.rows.nested
			n1[ri].nested.val.set((old) => old.substring(0, i) + scheduleType + old.substring(i + 1))
			commands.tickSchedule(i, scheduleType)
		}
	}

	const schedBox = (c, ri, i, row) => {
		const style = {
			width: baseWidth,
			height: baseWidth,
			backgroundColor: colors.rgb(schedColors[c]),
			opacity: row.yours ? 1 : 0.3,
			cursor: row.yours ? 'pointer' : undefined,
		}
		return (
			<span
				key={i}
				style={style}
				onClick={(e) => {
					e.preventDefault()
					schedClick(row, ri, i, false)
				}}
			/>
		)
	}

	const buttonColor = (ch, selected) => {
		return colors.transformColor(schedColors[ch], (c) => (selected ? c : c * 0.5 + 200))
	}

	return (
		<React.Fragment>
			<div style={grid1}>
				<div></div>
				<div></div>
				{prios.columns.map((col, i) => (
					<div style={header1} key={i}>
						{col}
					</div>
				))}
				{prios.rows.map((row, ri) => (
					<React.Fragment key={ri}>
						<div className={row.yours ? 'bolder' : undefined} style={labelStyle}>
							{row.pawn}
						</div>
						<div></div>
						{row.val.map((val, i) => prioBox(val, ri, i, row))}
					</React.Fragment>
				))}
			</div>
			<div style={grid2}>
				<div></div>
				<div></div>
				{[...Array(24)].map((_, i) => (
					<div style={header2} key={i}>
						<span>{i}</span>
					</div>
				))}
				{sched.rows.map((row, ri) => (
					<React.Fragment key={ri}>
						<div className={row.yours ? 'bolder' : undefined} style={labelStyle}>
							{row.pawn}
						</div>
						<div></div>
						{row.val.split('').map((c, i) => schedBox(c, ri, i, row))}
					</React.Fragment>
				))}
			</div>
			<div style={{ textAlign: 'center' }}>
				<Button.Group as="span" compact size="mini">
					{scheduleTypes.map((ch) => {
						const c = buttonColor(ch, scheduleType == ch)
						const bgColor = colors.rgb(c)
						const fgColor = colors.bwContrast(c)
						return (
							<Button key={ch} onClick={() => setScheduleType(ch)} style={{ color: fgColor, backgroundColor: bgColor }}>
								{schedNames[ch]}
							</Button>
						)
					})}
				</Button.Group>
			</div>
		</React.Fragment>
	)
}
