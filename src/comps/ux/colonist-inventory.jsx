import React from 'react'
import { useStateLink } from '@hookstate/core'
import { Button } from 'semantic-ui-react'
import inventory from '../../services/cmd_inventory'
import commands from '../../commands'

export default function ColonistThoughts() {
	const inventoryLink = useStateLink(inventory.ref)

	const grid = {
		paddingBottom: 10,
		display: 'grid',
		gridRowGap: 4,
		gridColumnGap: 4,
		gridTemplateColumns: '1fr 12fr 2fr 1fr',
		fontSize: 'calc(min(2.5vw, 1.1em))',
		alignItems: 'center'
	}

	const preview = {
		width: '2em',
		height: '2em',
		paddingRight: '3%'
	}

	const drop = (id) => () => {
		commands.drop(id)
	}

	const consume = (id) =>() => {
		commands.consume(id)
	}

	return (
		<React.Fragment>
			<div style={{ paddingTop: 20 }}><b>Equipment</b></div>
			<div style={grid}>
				{inventoryLink.value.equipment.map((item, i) => (
					<React.Fragment key={i}>
						<div>
							<img src={item.previewURL} style={preview} />
						</div>
						<div>
							{item.name}
						</div>
						<div style={{ textAlign: 'right' }}>
							{item.mass}kg
						</div>
						<div style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
							&nbsp;
							<Button style={{ padding: 4 }} as="span" icon onClick={drop(item.id)}><img src="/i/drop.png" /></Button>
						</div>
					</React.Fragment>
				))}
			</div>
			<div><b>Inventory</b></div>
			<div style={grid}>
				{inventoryLink.value.inventory.map((item, i) => (
					<React.Fragment key={i}>
						<div>
							<img src={item.previewURL} style={preview} />
						</div>
						<div>
							{item.name}
						</div>
						<div style={{ textAlign: 'right' }}>
							{item.mass}kg
						</div>
						<div style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
							&nbsp;
							{item.consumable ? <Button style={{ padding: 4 }} as="span" icon onClick={consume(item.id)}><img src="/i/consume.png" /></Button> : undefined}
							<Button style={{ padding: 4 }} as="span" icon onClick={drop(item.id)}><img src="/i/drop.png" /></Button>
						</div>
					</React.Fragment>
				))}
			</div>
		</React.Fragment>
	)
}