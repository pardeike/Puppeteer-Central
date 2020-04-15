import tools from '../tools'

var ws = undefined

let jobs = {}

const link = (_ws) => {
	ws = _ws
}

const msg = (msg) => {
	if (msg.type == 'job') {
		const job = jobs[msg.id]
		if (job) {
			const callback = job.callback
			delete jobs[msg.id]
			if (callback) callback(msg.info)
			return
		}
		console.log(`Received job for unknown id ${msg.id}`)
	}
}

const remove = (_e) => {}

const reset = () => {
	jobs = {}
}

const sendJob = (method, args, callback) => {
	const id = tools.uuid()
	jobs[id] = { callback }
	tools.send(ws, 'job', { id, method, args })
}

export default {
	link,
	msg,
	remove,
	reset,
	//
	sendJob,
}
