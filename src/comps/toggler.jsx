import React from 'react'
import { Image } from 'semantic-ui-react'

export default function Toggler(props) {
	const toggleStyle = {
		position: 'absolute',
		top: '6px',
		right: '8px',
		cursor: 'pointer',
	}

	const toggle = () => {
		props.settings.set(!props.settings.value)
	}

	return (
		<React.Fragment>
			<Image src="/i/menu.gif" style={toggleStyle} onClick={toggle} />
			{props.settings.value && props.children}
		</React.Fragment>
	)
}
