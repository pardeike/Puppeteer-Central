import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { useStateLink } from '@hookstate/core'
import { Popup } from 'semantic-ui-react'
import gear from '../../services/cmd_gear'

export default function ColonistThoughts() {
	const gearLink = useStateLink(gear.ref)
	const shortWidth = useMediaQuery({ query: '(max-width: 440px)' })
	const mediumWidth = useMediaQuery({ query: '(max-width: 620px)' })

	const section = {
		backgroundColor: '#eee',
		padding: 5,
		marginTop: 10
	}

	const grid = {
		display: 'flex',
		flexWrap: 'wrap'
	}

	const box = {
		position: 'relative',
		backgroundColor: '#888',
		flexBasis: `calc(${shortWidth ? 50 : mediumWidth ? 33.3 : 25}% - 5px)`,
		boxSizing: 'border-box',
		backgroundRepeat: 'no-repeat',
		backgroundSize: '75% 75%',
		backgroundPosition: '50% 30%',
		marginTop: 5,
		marginRight: 5
	}

	const content = {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		fontSize: '80%',
		lineHeight: '1.3'
	}

	const info = {
		backgroundColor: 'black',
		color: 'white',
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		padding: 3
	}

	const star = {
		position: 'absolute',
		right: 3,
		top: 3,
		lineHeight: 0
	}

	const extra = {
		position: 'absolute',
		left: 3,
		top: 3,
		lineHeight: 0
	}

	const qCategories = ['Awful', 'Poor', 'Normal', 'Good', 'Excellent', 'Masterwork', 'Legendary']
	const stars = (n) => (
		<div style={star}>
			{qCategories.map((_, i) => (
				<img key={i} src={`/i/star${i >= n ? '0' : '1'}.png`} width="10" height="10" />
			))}
		</div>)

	const apparelBox = (apparel, j) => (
		<div className="square" style={{ backgroundImage: `url("${apparel.previewURL}")`, ...box }}>
			<div style={content}>
				<div style={extra}>
					{apparel.tainted ? <img src="/i/tainted.png" width="8" height="10" style={{ marginRight: 3 }}/> : undefined}
					{apparel.forced ? <img src="/i/forced.png" width="8" height="10" /> : undefined}
				</div>
				{stars(apparel.quality)}
				<div style={info}>{apparel.name}</div>
			</div>
		</div>
	)

	return (
		<div>
			<div style={section} key={-1}>
				<div><b>General information</b></div>
				<div>Mass carried: <span style={{ float: 'right' }}>{gearLink.nested.currentMass.value} / {gearLink.nested.maxMass.value} kg</span></div>
				<div>Total sharp armor: <span style={{ float: 'right' }}>{gearLink.nested.overallArmor.value[0]}</span></div>
				<div>Total blunt armor: <span style={{ float: 'right' }}>{gearLink.nested.overallArmor.value[1]}</span></div>
				<div>Total heat armor: <span style={{ float: 'right' }}>{gearLink.nested.overallArmor.value[2]}</span></div>
				<div>Comfortable temperature: <span style={{ float: 'right' }}>{gearLink.nested.comfortableTemps.value[0]} / {gearLink.nested.comfortableTemps.value[1]}</span></div>
			</div>
			{gearLink.nested.parts.value.map((part, i) => (
				<div style={section} key={i}>
					<div><b>{part.name}</b></div>
					<div style={grid}>
						{part.apparels.map((apparel, j) => (
							<Popup
								key={j}
								offset={-8}
								content={<div>
									<div><b>{apparel.name}</b></div>
									<div>Quality: {qCategories[apparel.quality - 1]}{apparel.tainted ? <span>, tainted</span> : undefined}
										{apparel.forced ? <span>, forced</span> : undefined}</div>
									<div>Hitpoints: {apparel.hp1} / {apparel.hp2}</div>
									<div>Market value: ${apparel.mValue}</div>
									<div>Made of: {apparel.stuff}</div>
									<div>Mass: {apparel.mass} kg</div>
									<div>Armor: sharp={apparel.aSharp}, blunt={apparel.aBlunt} heat={apparel.aHeat}</div>
									<div>Insulation: cold={apparel.iCold}, heat={apparel.iHeat}</div>
								</div>}
								size="mini"
								trigger={apparelBox(apparel, j)}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	)
}