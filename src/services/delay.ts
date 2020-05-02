const lastEvents = {}

const delay = {
	every: (name, delta, callback) => {
		const now = new Date().getTime()
		if (now - (lastEvents[name] || 0) >= delta) {
			lastEvents[name] = now
			callback()
		}
	},
}
export default delay
