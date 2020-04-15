import React from 'react'
import { Dimmer, Placeholder, Segment, Loader } from 'semantic-ui-react'

export default function NoAssignment() {
	return (
		<Segment.Group>
			<Segment basic style={{ backgroundColor: 'white' }}>
				<Dimmer active inverted style={{ backgroundColor: 'rgba(255,255,255,.2)' }}>
					<Loader indeterminate>No assignment yet</Loader>
				</Dimmer>
				<Placeholder>
					<Placeholder.Header image>
						<Placeholder.Line />
						<Placeholder.Line />
					</Placeholder.Header>
					<Placeholder.Paragraph>
						<Placeholder.Line />
						<Placeholder.Line />
						<Placeholder.Line />
						<Placeholder.Line />
					</Placeholder.Paragraph>
				</Placeholder>
			</Segment>
		</Segment.Group>
	)
}
