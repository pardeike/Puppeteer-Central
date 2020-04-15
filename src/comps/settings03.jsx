import React, { useState } from 'react'
import useIsMounted from '@rodw95/use-mounted-state'
import { Card, Form, TextArea, Button, Checkbox, Message } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import { Spacer } from '../comps/tools'
import Toggler from '../comps/toggler'
import settings from '../services/cmd_settings'
import togglesRef from '../hooks/toggles'

export default function Settings03(props) {
	const settingsLinks = useStateLink(settings.ref)
	const info = settingsLinks.nested.info
	const togglesLinks = useStateLink(togglesRef)
	const isMounted = useIsMounted()

	const handleSubmit = () => {
		settings.update('info', {
			online: info.nested.online.value,
			title: info.nested.title.value,
			matureOnly: info.nested.matureOnly.value,
		})
		setSuccess(true)
		setTimeout(() => {
			if (isMounted()) setSuccess(false)
		}, 2000)
		event.preventDefault()
	}

	const [success, setSuccess] = useState(false)

	if (props.mode != 'streamer' || !info.value) return <React.Fragment></React.Fragment>

	return (
		<Card fluid>
			<Card.Content>
				<Card.Header>Stream Information</Card.Header>
				<Toggler settings={togglesLinks.nested.settings03}>
					<Spacer />
					<Card.Description>
						<Form onSubmit={handleSubmit} success={success}>
							<Form.Field>
								<Checkbox
									toggle
									label="Online and visible"
									checked={info.nested.online.value}
									onChange={(_e, o) => info.nested.online.set(o.checked)}
								/>
							</Form.Field>
							<Form.Field>
								<TextArea placeholder="Title" value={info.nested.title.value} onChange={(_e, o) => info.nested.title.set(o.value)} />
							</Form.Field>
							<Form.Field>
								<Checkbox label="Mature audiences" checked={info.nested.matureOnly.value} onChange={(_e, o) => info.nested.matureOnly.set(o.checked)} />
							</Form.Field>
							<Message success header="Status" content="Stream information updated" />
							<Button size="tiny" primary compact type="submit">
								Save
							</Button>
						</Form>
					</Card.Description>
				</Toggler>
			</Card.Content>
		</Card>
	)
}
