import React, { createRef, useState } from 'react'
import { Popup } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import Profile from '../comps/profile'
import stream from '../services/cmd_stream'
import status from '../services/cmd_status'

export default function AccountProxy() {
	const popRef = createRef()
	const streamLink = useStateLink(stream.ref)
	const statusLink = useStateLink(status.ref)
	const serviceLogo = `/i/service-${statusLink.value.user.service}.png`
	const picture = statusLink.value.user.picture || '/i/spinner.gif'
	const [open, setOpen] = useState(false)

	const pictureStyle = {
		animationName: 'picture-open',
		animationDuration: '0.3s',
		animationFillMode: 'forwards',
	}

	const popupStyle = {
		opacity: 0,
		animationName: 'popup-open',
		animationDuration: '0.2s',
		animationDelay: '0.2s',
		animationFillMode: 'forwards',
	}

	return (
		<React.Fragment>
			<style>{`
				#picture {
					width: 18px;
					height: 18px;
					border-radius: 500rem;
					position: relative;
					cursor: pointer;
				}
				#picture:hover {
					filter: opacity(0.75);
				}
				@keyframes picture-open {
					from {
						left: 0px;
					}
					to {
						left: -10px;
					}
				}
				@keyframes popup-open {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}
			`}</style>
			{streamLink.value.connected ? <span /> : <img src="/i/attention.png" height="16" id="attention" />}
			<Popup
				on="click"
				position="bottom right"
				context={popRef}
				style={popupStyle}
				trigger={<img id="picture" src={picture} style={open ? pictureStyle : {}} ref={popRef} />}
				onOpen={() => setOpen(true)}
				onClose={() => setOpen(false)}>
				<Popup.Header>
					Account
					{statusLink.value.user.service && <img src={serviceLogo} style={{ float: 'right', height: '16px', paddingTop: '2px' }} />}
				</Popup.Header>
				<Popup.Content>
					<Profile />
				</Popup.Content>
			</Popup>
		</React.Fragment>
	)
}
