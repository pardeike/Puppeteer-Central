const fetch = require('node-fetch')
const TwitchStrategy = require('passport-twitch.js').Strategy

async function verifyToken(token) {
	const url = 'https://api.twitch.tv/helix/users'
	const response = await fetch(url, {
		headers: new fetch.Headers({
			Authorization: `Bearer ${token}`,
		}),
	})
	const result = await response.json()
	return result.exp > 0 && result.exp < new Date().getTime() / 1000
}

const strategy = new TwitchStrategy(
	{
		clientID: process.env.TWITCH_CLIENT_ID,
		clientSecret: process.env.TWITCH_CLIENT_SECRET,
		callbackURL: process.env.TWITCH_CALLBACK,
		scope: '',
	},
	async (accessToken, _refreshToken, profile, cb) => {
		await verifyToken(accessToken)
		cb(undefined, {
			id: profile.id,
			name: profile.display_name,
			picture: profile.profile_image_url,
			service: 'twitch',
		})
	}
)

module.exports = {
	strategy,
}
