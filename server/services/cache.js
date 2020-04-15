const cache = require('memory-cache')

const memCache = new cache.Cache()
const cacheDuration = 60 * 1000 // ms

const responseCache = contentType => {
	return (req, res, next) => {
		const key = req.params.name
		const body = memCache.get(key)
		if (body) {
			res.setHeader('content-type', contentType)
			res.send(body)
			return
		}
		res.sendResponse = res.send
		res.send = body => {
			if (body) memCache.put(key, body, cacheDuration)
			res.setHeader('content-type', contentType)
			res.sendResponse(body)
		}
		next()
	}
}

module.exports = responseCache
