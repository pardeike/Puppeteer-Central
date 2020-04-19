import React, { useState } from 'react'
import { Card, Table } from 'semantic-ui-react'
import { useStateLink } from '@hookstate/core'
import { Spacer } from '../comps/tools'
import Toggler from '../comps/toggler'
import Viewer from '../comps/viewer'
import togglesRef from '../hooks/toggles'
import SearchableHeader from '../comps/searchable-header'
import status from '../services/cmd_status'

export default function Settings04(props) {
	const statusLinks = useStateLink(status.ref)
	const togglesLinks = useStateLink(togglesRef)

	const colonistFilterState = useState(undefined)
	const [colonistFilter] = colonistFilterState
	const filterColonists = (c) => colonistFilter == undefined || c.name.toLowerCase().indexOf(colonistFilter.toLowerCase()) >= 0

	const viewerFilterState = useState(undefined)
	const [viewerFilter] = viewerFilterState
	const filterViewers = (v) => viewerFilter == undefined || (v.controller && v.controller.name.toLowerCase().indexOf(viewerFilter.toLowerCase()) >= 0)

	const assignViewer = (colonistID) => (viewer) => {
		status.assign(colonistID, viewer)
	}

	const removeViewer = (colonistID) => () => {
		status.assign(colonistID, null)
	}

	if (props.mode != 'streamer' || statusLinks.value.game.colonists.length == 0) return <React.Fragment></React.Fragment>

	return (
		<Card fluid>
			<Card.Content>
				<Card.Header>Colonist Assignments</Card.Header>
				<Toggler settings={togglesLinks.nested.settings04}>
					<Spacer />
					<Card.Description>
						{statusLinks.value.game.connected ? (
							<Table celled unstackable singleLine={true}>
								<Table.Header>
									<Table.Row>
										<SearchableHeader title="Colonist" state={colonistFilterState} />
										<SearchableHeader title="Assigned To" state={viewerFilterState} />
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{statusLinks.value.game.colonists
										.filter(filterColonists)
										.filter(filterViewers)
										.map((colonist) => (
											<Table.Row key={colonist.id}>
												<Table.Cell>{colonist.name}</Table.Cell>
												<Table.Cell>
													<Viewer viewer={colonist.controller} assign={assignViewer(colonist.id)} remove={removeViewer(colonist.id)} />
												</Table.Cell>
											</Table.Row>
										))}
								</Table.Body>
							</Table>
						) : (
							<i>Connect Rimworld to edit colonist assignments</i>
						)}
					</Card.Description>
				</Toggler>
			</Card.Content>
		</Card>
	)
}
