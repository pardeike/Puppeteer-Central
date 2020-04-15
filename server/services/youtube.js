const fetch = require('node-fetch')
const querystring = require('querystring')
const YoutubeV3Strategy = require('passport-youtube-v3').Strategy

async function verifyToken(token) {
	const url = `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&maxResults=1`
	const response = await fetch(url, {
		headers: {
			Authorization: 'Bearer ' + token
		}
	})
	const result = await response.json()
	if (result.error) {
		console.log(`YouTube Verification returned error ${result.error.code}: ${result.error.errors[0].message}`)
		return ''
	}
	return result.items[0].id
}

const strategy = new YoutubeV3Strategy(
	{
		clientID: process.env.YOUTUBE_OAUTH_TEST_APP_CLIENT_ID,
		clientSecret: process.env.YOUTUBE_OAUTH_TEST_APP_CLIENT_SECRET,
		callbackURL: process.env.YOUTUBE_CALLBACK,
		scope: 'https://www.googleapis.com/auth/youtube.readonly'
	},
	async (accessToken, _refreshToken, profile, cb) => {
		const id = await verifyToken(accessToken)
		if (profile.id == id) {
			cb(undefined, {
				id: profile.id,
				name: profile.displayName,
				picture: profile._json.items[0].snippet.thumbnails.high.url,
				service: 'youtube'
			})
			return
		}
		console.log(`Users YouTube IDs do not match (${profile.id} != ${id})`)
	}
)

module.exports = {
	strategy
}
