import React, { useState } from 'react'
import { Button, Icon } from 'semantic-ui-react'

const grid = {
	display: 'grid',
	gridColumnGap: '10px',
	gridTemplateColumns: 'min-content auto min-content',
}

const miniButton = {
	paddingTop: 4,
	paddingBottom: 4,
}

export default function Stepper(props) {
	const [value, setValue] = useState(props.value)

	const changeValue = (direction) => {
		const values = props.choices.map((c) => c.toLowerCase())
		const len = values.length
		let idx = values.indexOf(props.value.toLowerCase()) + direction
		if (idx < 0) idx = len - 1
		if (idx >= len) idx = 0
		const newValue = props.choices[idx]
		if (newValue) {
			setValue(newValue)
			props.onChange(newValue)
		}
	}

	return (
		<div style={grid}>
			<Button style={miniButton} compact icon={<Icon name="caret left" onClick={() => changeValue(-1)} />} />
			<div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>{value}</div>
			<Button style={miniButton} compact icon={<Icon name="caret right" onClick={() => changeValue(1)} />} />
		</div>
	)
}
