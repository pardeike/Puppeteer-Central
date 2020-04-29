const client = {

	// basic user properties
	id = 0,
	name = '',
	service: '',
	picture: '',
	stalled: false,

	// same users share this client object but with different sockets
	sockets: [],

	// a server has its own socket
	server: undefined,

	// basic server properties
	info = {
		started: Ticks,
		online: false,
		title: '',
		matureOnly: false
	},
	game: {
		connected: false,
		colonists: []
	},
	viewers: [],

	// methods

	same = (c) => c.service == this.service && c.id == this.id,
}

module.exports = client