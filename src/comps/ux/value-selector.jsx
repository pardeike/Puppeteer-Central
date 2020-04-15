import React from 'react'
import { Dropdown } from 'semantic-ui-react'

export function valueSelector(label, value, options, onChange) {
	return (
		<React.Fragment>
			<div style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}>{label}</div>
			<Dropdown selection upward value={value} pointing={false} options={options} onChange={(_e, data) => onChange(data.value)} />
		</React.Fragment>
	)
}
