import React, { useState } from 'react'
import { useStateLink } from '@hookstate/core'
import { Form, Input, Message } from 'semantic-ui-react'
import chat from '../../services/cmd_chat'

export default function Chat() {
	const chatLink = useStateLink(chat.ref)
	const [chatMessage, setChatMessage] = useState('')

	const handleSendChat = () => {
		let msg = chatMessage.trim()
		if (msg.startsWith('!')) msg = msg.slice(1)
		if (msg) chat.send(msg)
		setChatMessage('')
	}

	return (
		<React.Fragment>
			<Form onSubmit={handleSendChat}>
				<Input fluid size="mini" placeholder="Commands" value={chatMessage} action="Send" onChange={(_e, o) => setChatMessage(o.value)} />
			</Form>
			{chatLink
				.access()
				.get()
				.filter((msg, idx) => msg.result.length > 0 && idx < 4)
				.map((msg, idx) => (
					<Message
						key={idx}
						style={{
							padding: '1em',
							userSelect: 'text',
							wordWrap: 'anywhere',
							opacity: 1 - idx / 4,
							width: '100%',
							marginBottom: 0,
						}}
						size="tiny"
						compact>
						<b>{msg.message}</b>
						{msg.message && <br />}
						<span style={{ textTransform: 'capitalize' }}>{msg.result}</span>
					</Message>
				))}
		</React.Fragment>
	)
}
