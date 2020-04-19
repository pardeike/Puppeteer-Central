import React, { useState, useEffect, createRef } from 'react'
import { Search, Image } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { createStateLink, useStateLink } from '@hookstate/core'
import fetch from 'node-fetch'

export default function Viewer(props) {
	const [search, setSearch] = useState(undefined)
	const [results, setResults] = useState([])
	const [initialized, setInitialized] = useState(false)
	const searchFieldRef = createRef()

	const viewersRef = createStateLink([])
	const viewersLinks = useStateLink(viewersRef)

	const pickResult = ({ _title, id, service, name, picture }) => {
		const viewer = { id, service, name, picture }
		props.assign(viewer)
		setTimeout(endSearch, 0)
	}

	const endSearch = () => {
		setSearch(undefined)
		setInitialized(false)
	}

	const updateResults = (val) => {
		setSearch(val)
		const list = viewersLinks.value
			.filter((v) => v.name.toLowerCase().indexOf(val.toLowerCase()) != -1)
			.map((v) => ({
				title: v.name,
				id: v.id,
				service: v.service,
				name: v.name,
				picture: v.picture,
			}))
		if (list.count > 5 && val.length < 3) return []
		setResults(list)
	}

	const avatarStyle = (size) => ({
		float: 'unset',
		width: `${size}px`,
		height: `${size}px`,
		top: '-2px',
	})

	const resultRenderer = (v) => (
		<div style={{ fontSize: '12pt', width: '100%' }}>
			<Image src={v.picture} avatar style={avatarStyle(22)} /> {v.name}
		</div>
	)
	resultRenderer.propTypes = {
		title: PropTypes.string,
		id: PropTypes.string,
		service: PropTypes.string,
		name: PropTypes.string,
		picture: PropTypes.string,
	}

	useEffect(() => {
		const fetchViewers = async () => {
			searchFieldRef.current.children[0].children[0].children[0].focus()
			setInitialized(true)
			const response = await fetch('/viewers')
			const viewers = await response.json()
			viewersLinks.set(viewers)
		}
		if (search != undefined && !initialized) fetchViewers()
		// no cleanup here
	})

	if (search != undefined) {
		return (
			<div ref={searchFieldRef}>
				<Search
					size="mini"
					fluid
					selectFirstResult={true}
					loading={viewersLinks.value.length == 0}
					onBlur={endSearch}
					onResultSelect={(_e, o) => pickResult(o.result)}
					onSearchChange={(_e, o) => updateResults(o.value)}
					results={results}
					value={search}
					resultRenderer={resultRenderer}
				/>
			</div>
		)
	}

	return (
		<React.Fragment>
			<img src="/i/pencil.png" style={{ float: 'right', cursor: 'pointer' }} onClick={() => setSearch('')} />
			{props.viewer ? (
				<React.Fragment>
					<img src="/i/delete.png" style={{ float: 'right', cursor: 'pointer', paddingRight: '12px' }} onClick={() => props.remove()} />
					<Image src={props.viewer.picture} avatar style={avatarStyle(18)} /> {props.viewer.name}
				</React.Fragment>
			) : (
				''
			)}
		</React.Fragment>
	)
}
