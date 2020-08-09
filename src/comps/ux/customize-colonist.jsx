import React, { useState } from 'react'
import { useStateLink } from '@hookstate/core'
import { Button } from 'semantic-ui-react'
import { Slider } from 'react-semantic-ui-range'
import Stepper from './stepper'
import game from '../../services/cmd_game-info'
import commands from '../../commands'

const settings = { min: 0, max: 100, step: 5 }

const bubbleGrid = {
	display: 'grid',
	gridRowGap: '10px',
	gridColumnGap: '10px',
	gridTemplateColumns: 'min-content 200px',
}

const innerGrid = {
	display: 'grid',
	gridTemplateColumns: 'auto 35px',
}

const valueCol = {
	textAlign: 'right',
}

const miniButton = {
	paddingTop: 4,
	paddingBottom: 4,
}

export default function CustomizeColonist() {
	const gameLink = useStateLink(game.ref)

	const genderPart = (
		<React.Fragment>
			<div style={{ whiteSpace: 'nowrap', marginTop: 'auto', marginBottom: 'auto' }}>Gender</div>
			<div>
				<Button
					style={miniButton}
					size="mini"
					compact
					active={gameLink.value.style.gender == 'Male'}
					onClick={() => {
						gameLink.nested.style.nested.gender.set('Male')
						commands.customize('gender', 'Male')
					}}>
					Male
				</Button>
				&nbsp;
				<Button
					style={miniButton}
					size="mini"
					compact
					active={gameLink.value.style.gender == 'Female'}
					onClick={() => {
						gameLink.nested.style.nested.gender.set('Female')
						commands.customize('gender', 'Female')
					}}>
					Female
				</Button>
			</div>
		</React.Fragment>
	)

	const bodyTypePart = (
		<React.Fragment>
			<div style={{ whiteSpace: 'nowrap', marginTop: 'auto', marginBottom: 'auto' }}>Body Style</div>
			<Stepper
				value={gameLink.value.style.bodyType}
				choices={gameLink.value.bodyTypes}
				onChange={(val) => {
					gameLink.nested.style.nested.bodyType.set(val)
					commands.customize('bodyType', val)
				}}
			/>
		</React.Fragment>
	)

	const hairStylePart = (
		<React.Fragment>
			<div style={{ whiteSpace: 'nowrap', marginTop: 'auto', marginBottom: 'auto' }}>Hair Style</div>
			<Stepper
				value={gameLink.value.style.hairStyle}
				choices={gameLink.value.hairStyles}
				onChange={(val) => {
					gameLink.nested.style.nested.hairStyle.set(val)
					commands.customize('hairStyle', val)
				}}
			/>
		</React.Fragment>
	)

	const melaninPart = (
		<React.Fragment>
			<div style={{ whiteSpace: 'nowrap', marginTop: 'auto', marginBottom: 'auto' }}>Melanin</div>
			<div style={innerGrid}>
				<Slider
					value={gameLink.value.style.melanin}
					color="orange"
					settings={{
						...settings,
						onChange: (val) => {
							gameLink.nested.style.nested.melanin.set(val)
							commands.customize('melanin', val)
						},
					}}
				/>
				<div style={valueCol}>{gameLink.value.style.melanin}%</div>
			</div>
		</React.Fragment>
	)

	const hairColorPart = (
		<React.Fragment>
			<div style={{ whiteSpace: 'nowrap' }}>Hair Color</div>
			<div style={innerGrid}>
				<Slider
					style={{ padding: '2px' }}
					value={gameLink.value.style.hairColor[0]}
					color="red"
					settings={{
						...settings,
						onChange: (val) => {
							gameLink.nested.style.nested.hairColor.nested[0].set(val)
							commands.customize('hairColor', gameLink.nested.style.nested.hairColor.value.map((n) => `${n}`).join(','))
						},
					}}
				/>
				<div style={valueCol}>{gameLink.value.style.hairColor[0]}%</div>
				<Slider
					style={{ padding: '2px' }}
					value={gameLink.value.style.hairColor[1]}
					color="green"
					settings={{
						...settings,
						onChange: (val) => {
							gameLink.nested.style.nested.hairColor.nested[1].set(val)
							commands.customize('hairColor', gameLink.nested.style.nested.hairColor.value.map((n) => `${n}`).join(','))
						},
					}}
				/>
				<div style={valueCol}>{gameLink.value.style.hairColor[1]}%</div>
				<Slider
					style={{ padding: '2px' }}
					value={gameLink.value.style.hairColor[2]}
					color="blue"
					settings={{
						...settings,
						onChange: (val) => {
							gameLink.nested.style.nested.hairColor.nested[2].set(val)
							commands.customize('hairColor', gameLink.nested.style.nested.hairColor.value.map((n) => `${n}`).join(','))
						},
					}}
				/>
				<div style={valueCol}>{gameLink.value.style.hairColor[2]}%</div>
			</div>
		</React.Fragment>
	)

	return (
		<div style={bubbleGrid}>
			{genderPart}
			{bodyTypePart}
			{hairStylePart}
			{melaninPart}
			{hairColorPart}
		</div>
	)
}
