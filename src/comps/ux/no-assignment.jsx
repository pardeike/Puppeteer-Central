import React from 'react'
import Chat from './chat'
import { Dimmer, Placeholder, Segment, Loader } from 'semantic-ui-react'

export default function NoAssignment() {
	return (
		<Segment.Group>
			<Segment basic style={{ backgroundColor: 'white' }}>
				<Dimmer active inverted style={{ backgroundColor: 'rgba(255,255,255,.2)' }}>
					<Loader size="small" indeterminate>
						No assignment yet
					</Loader>
				</Dimmer>
				<Placeholder>
					<Placeholder.Header image>
						<Placeholder.Line />
						<Placeholder.Line />
					</Placeholder.Header>
				</Placeholder>
			</Segment>
			<Segment compact style={{ backgroundColor: 'white' }}>
				<Chat />
			</Segment>
		</Segment.Group>
	)
}
