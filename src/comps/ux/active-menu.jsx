import React, { useState } from 'react'
import jobs from '../../services/cmd_jobs'
import { Dropdown } from 'semantic-ui-react'

export default function ActiveMenu(props) {
	const [loading, setLoading] = useState(false)
	const [options, setOptions] = useState([])
	const [value, setValue] = useState(null)

	const load = () => {
		setLoading(true)
		jobs.sendJob(props.optionsCommand, props.optionsArgs, (res) => {
			const results = res.results?.map((result) => ({ key: result.id, text: result.name, value: result.id })) ?? []
			const opt = [{ key: -1, className: 'hidden-menu', value: -1 }, ...results]
			setOptions(opt)
			setLoading(false)
		})
	}

	const action = (_e, data) => {
		jobs.sendJob(props.actionCommand, [`${data.value}`, ...props.actionArgs], (res) => {
			if (res != 'ok') console.log(`${props.actionCommand} result: ${res}`)
		})
	}

	const close = (_e, _data) => {
		setValue(null)
		setOptions([])
	}

	return (
		<Dropdown
			selection
			clearable={false}
			placeholder={props.placeholder}
			value={value}
			pointing={false}
			options={options}
			loading={loading}
			onClick={load}
			onChange={action}
			onClose={close}
		/>
	)
}
