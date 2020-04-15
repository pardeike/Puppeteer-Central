const { encode } = require('./bson')

function randomCode() {
	return `${Math.random()
		.toString(36)
		.substring(2, 10)}${Math.random()
		.toString(36)
		.substring(2, 10)}`
}

function merge(current, updates) {
	if (current) {
		const keys = Object.keys(updates)
		if (keys.length > 0)
			for (const key of keys) {
				if (!current.hasOwnProperty || !current.hasOwnProperty(key) || updates[key] == undefined || typeof updates[key] !== 'object')
					current[key] = updates[key]
				else merge(current[key], updates[key])
			}
		else for (const key of Object.keys(current)) delete current[key]
	}
	return current
}

function remove(arr, pred) {
	const idx = arr.findIndex(a => pred(a))
	if (idx > -1) arr.splice(idx, 1)
}

function errorMessage(msg) {
	return encode({ type: 'error', message: msg })
}

module.exports = {
	randomCode,
	merge,
	remove,
	errorMessage
}
