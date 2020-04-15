function errorHandler(err, _req, res, _next) {
	if (err.stack) console.error(err.stack)
	res.status(500).send(`Error: ${JSON.stringify(err)}`)
}

module.exports = errorHandler
