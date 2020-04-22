const fetch = require('node-fetch')
const querystring = require('querystring')
const YoutubeV3Strategy = require('passport-youtube-v3').Strategy

async function verifyToken(token) {
	const url = ` https://www.googleapis.com/oauth2/v1/userinfo`
	const response = await fetch(url, {
		headers: {
			Authorization: 'Bearer ' + token,
		},
	})
	return await response.json()
}

const strategy = new YoutubeV3Strategy(
	{
		clientID: process.env.YOUTUBE_OAUTH_TEST_APP_CLIENT_ID,
		clientSecret: process.env.YOUTUBE_OAUTH_TEST_APP_CLIENT_SECRET,
		callbackURL: process.env.YOUTUBE_CALLBACK,
		scope: ['email', 'openid', 'profile', 'https://www.googleapis.com/auth/youtube.readonly'],
	},
	async (accessToken, _refreshToken, profile, cb) => {
		const identity = await verifyToken(accessToken)
		if (!identity) {
			console.log(`Users YouTube token does not work`)
			return
		}
		cb(undefined, {
			id: identity.id,
			name: identity.name,
			picture: identity.picture,
			service: 'youtube',
		})
	}
)

module.exports = {
	strategy,
}
