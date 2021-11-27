const fetch = require('node-fetch')
const TwitchStrategy = require('@d-fischer/passport-twitch').Strategy

/* scratchpad

curl -H "Accept: application/vnd.twitchtv.v5+json" -H "Client-ID: xy9z8guebyu1vqjj2kejzg8lgmq719" -X GET "https://api.twitch.tv/kraken/users?login=brrainz,Hyaenee"
{"_total":2,"users":[{"display_name":"Brrainz","_id":"53495155","name":"brrainz","type":"user","bio":"Software Developer. Currently working for the Swedish Police.","created_at":"2013-12-19T15:05:37.058499Z","updated_at":"2020-08-05T20:27:29.414681Z","logo":"https://static-cdn.jtvnw.net/jtv_user_pictures/brrainz-profile_image-eb974dee27b68e39-300x300.jpeg"},{"display_name":"Hyaenee","_id":"183149828","name":"hyaenee","type":"user","bio":"Willkommen bei den Hyänen ! Setz dich her dann sind wir mehr! ","created_at":"2017-11-25T09:29:54.978116Z","updated_at":"2020-08-06T08:03:13.209403Z","logo":"https://static-cdn.jtvnw.net/jtv_user_pictures/101d9641-5fb0-4d7b-9792-3f8613ff7a23-profile_image-300x300.png"}]}

curl -H "Accept: application/vnd.twitchtv.v5+json" -H "Client-ID: xy9z8guebyu1vqjj2kejzg8lgmq719" -X GET "https://api.twitch.tv/kraken/streams/183149828"
{"stream":{"_id":258284146,"game":"RimWorld","broadcast_platform":"live","community_id":"","community_ids":[],"viewers":2,"video_height":1080,"average_fps":60,"delay":0,"created_at":"2020-08-06T18:03:47Z","is_playlist":false,"stream_type":"live","preview":{"small":"https://static-cdn.jtvnw.net/previews-ttv/live_user_hyaenee-80x45.jpg","medium":"https://static-cdn.jtvnw.net/previews-ttv/live_user_hyaenee-320x180.jpg","large":"https://static-cdn.jtvnw.net/previews-ttv/live_user_hyaenee-640x360.jpg","template":"https://static-cdn.jtvnw.net/previews-ttv/live_user_hyaenee-{width}x{height}.jpg"},"channel":{"mature":true,"status":"Steuer dein Kolonisten [Toolkit + Puppeteer] !puppeteer | !discord 💬 | !sr","broadcaster_language":"de","broadcaster_software":"","display_name":"Hyaenee","game":"RimWorld","language":"de","_id":183149828,"name":"hyaenee","created_at":"2017-11-25T09:29:54.978116Z","updated_at":"2020-08-06T18:03:44.691Z","partner":false,"logo":"https://static-cdn.jtvnw.net/jtv_user_pictures/101d9641-5fb0-4d7b-9792-3f8613ff7a23-profile_image-300x300.png","video_banner":"https://static-cdn.jtvnw.net/jtv_user_pictures/02ad854e-40e0-456d-b9fd-3dc5903245af-channel_offline_image-1920x1080.jpeg","profile_banner":"https://static-cdn.jtvnw.net/jtv_user_pictures/2c2a56f9-f1ce-47d6-8185-d3b3484f225e-profile_banner-480.jpeg","profile_banner_background_color":"","url":"https://www.twitch.tv/hyaenee","views":8692,"followers":629,"broadcaster_type":"","description":"Willkommen bei den Hyänen ! Setz dich her dann sind wir mehr! ","private_video":false,"privacy_options_enabled":false}}}
{"stream":null}

*/

async function streamInfo(streamIds) {
	const fetcher = async (streamId) => {
		const url = `https://api.twitch.tv/kraken/streams/${streamId}`
		const response = await fetch(url, {
			headers: new fetch.Headers({
				Accept: 'application/vnd.twitchtv.v5+json',
				'Client-ID': process.env.TWITCH_CLIENT_ID,
			}),
		})
		const json = await response.json()
		const stream = json.stream
		return {
			id: streamId,
			info: stream && {
				id: streamId,
				count: stream.viewers,
				language: stream.channel.broadcaster_language,
				title: stream.channel.status,
				description: stream.channel.description,
			},
		}
	}
	return Promise.all(streamIds.map(fetcher))
}

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
			name: profile.login,
			picture: profile.profile_image_url,
			service: 'twitch',
		})
	}
)

module.exports = {
	strategy,
	streamInfo,
}
