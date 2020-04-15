import React, { useState, useCallback } from 'react'
import { Table, Input } from 'semantic-ui-react'

export default function SearchableHeader(props) {
	const [search, setSearch] = props.state
	const [fixedSearch, setFixedSearch] = useState(false)

	const escFunction = useCallback((event) => {
		if (event.keyCode === 13) {
			setFixedSearch(true)
		}
		if (event.keyCode === 9 || event.keyCode === 27) {
			setSearch(undefined)
		}
	}, [])

	const endFixedSearch = () => {
		setFixedSearch(false)
		setSearch(undefined)
	}

	const filterRef = (element) => {
		if (element) {
			element.focus()
			addEventListener('keydown', escFunction, false)
			return
		}
		removeEventListener('keydown', escFunction, false)
	}

	return (
		<Table.HeaderCell onClick={() => setSearch('')}>
			{search != undefined && !fixedSearch ? (
				<Input ref={filterRef} transparent size="mini" value={search} onChange={(_e, o) => setSearch(o.value)} />
			) : (
				<span
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						if (fixedSearch) {
							endFixedSearch()
							e.stopPropagation()
						}
					}}>
					<img src={`/i/${fixedSearch ? 'delete' : 'search'}.png`} />
					&nbsp; {fixedSearch ? search : props.title}
				</span>
			)}
		</Table.HeaderCell>
	)
}
