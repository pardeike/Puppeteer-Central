import React, { useState } from 'react'
import { useStateLink } from '@hookstate/core'
import { Form, Input, Message, Search } from 'semantic-ui-react'
import chat from '../../services/cmd_chat'
import game from '../../services/cmd_game-info'
import jobs from '../../services/cmd_jobs'

export default function Chat() {
	const gameLink = useStateLink(game.ref)
	const chatLink = useStateLink(chat.ref)
	const [chatMessage, setChatMessage] = useState('')
	const [results, setResults] = useState([])

	const handleSendChat = () => {
		let msg = chatMessage.trim()
		if (msg.startsWith('!')) msg = msg.slice(1)
		if (msg) chat.send(msg)
		setChatMessage('')
		setResults([])
	}

	const resultRenderer = ({ title }) => <span>{title}</span>
	const itemCommandRegex = /(.+) (.+)/i

	const handleSearchChange = (e, data) => {
		setChatMessage(data.value)
		const find = data.value.match(itemCommandRegex)
		if (find && find[2] && find[2].length >= 2) {
			jobs.sendJob('toolkit-item-search', [find[1], find[2]], (res) => {
				let matches = res.map((t) => ({ title: t })) ?? []
				setResults(matches)
			})
			return
		}
		const isMatch = (t) => data.value == '!' || data.value == '?' || t.toLowerCase().indexOf(data.value.toLowerCase()) != -1
		const matches = gameLink.value.tt_commands.filter((t) => isMatch(t)).map((t) => ({ title: t }))
		setResults(matches)
	}

	const chooseSearchResult = (e, data) => {
		const val = data.result.title
		const find = chatMessage.match(itemCommandRegex)
		if (find && find[2]) setChatMessage(`${find[1]} ${val}`)
		else setChatMessage(val)
	}

	return (
		<React.Fragment>
			<Form onSubmit={handleSendChat}>
				<Search
					action="Send"
					style={{ width: '100%' }}
					fluid={true}
					showNoResults={false}
					onResultSelect={chooseSearchResult}
					onSearchChange={handleSearchChange}
					value={chatMessage}
					resultRenderer={resultRenderer}
					results={results}
				/>
				{false && <Input fluid size="mini" placeholder="Commands" value={chatMessage} action="Send" onChange={(_e, o) => setChatMessage(o.value)} />}
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
						<b style={{ userSelect: 'text' }}>{msg.message}</b>
						{msg.message && <br />}
						<span style={{ userSelect: 'text' }}>{msg.result.replace(/^\w/, (c) => c.toUpperCase())}</span>
					</Message>
				))}
		</React.Fragment>
	)
}
