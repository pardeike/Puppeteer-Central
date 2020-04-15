const token = require('../services/token')
const peers = require('../services/peers')
const fetch = require('node-fetch')

const getYoutubeAPI = async url => {
	const response = await fetch(url)
	return await response.json()
}

function gameToken(req, res) {
	const info = token.createGameToken(req.user)
	return res.json(info)
}

function availableStreamers(_req, res) {
	const result = peers.availableStreamers()
	return res.json(result)
}

function viewers(req, res) {
	const result = peers.getViewers(req.user, req.query.s)
	return res.json(result)
}

async function youtubePreview(req, res) {
	const baseURL = 'https://www.googleapis.com/youtube/v3'
	const key = process.env.GOOGLE_YOUTUBE_API_KEY
	const channelID = req.params.id
	console.log(`Fetching channel ${channelID}`)
	const res2 = await getYoutubeAPI(`${baseURL}/search?part=snippet&channelId=${channelID}&eventType=live&maxResults=1&order=date&type=video&key=${key}`)
	if (!res2 || !res2.items || res2.items.length == 0) {
		console.log(`Youtuber ${channelID} not live`)
		res.status(404).send()
		return
	}
	const previewURL = res2.items[0].snippet.thumbnails.medium.url
	const res3 = await fetch(previewURL)
	const picture = await res3.buffer()
	res.send(picture)
}

module.exports = {
	gameToken,
	availableStreamers,
	viewers,
	youtubePreview
}
