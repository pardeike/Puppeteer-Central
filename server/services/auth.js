const passport = require('passport')
const twitch = require('./twitch')
const youtube = require('./youtube')
const token = require('./token')

// https://developers.google.com/identity/protocols/oauth2/web-server

function register(app) {
	passport.use(twitch.strategy)
	passport.use(youtube.strategy)
	passport.serializeUser((data, cb) => cb(undefined, data))
	passport.deserializeUser((data, cb) => cb(undefined, data))
	app.use(passport.initialize())
	app.get(
		'/auth/youtube',
		passport.authenticate('youtube', {
			scope: ['email', 'openid', 'profile', 'https://www.googleapis.com/auth/youtube.readonly'],
		}),
		login
	)
	app.get('/auth/twitch', passport.authenticate('twitch.js', { scope: [''] }), login)
}

function login(req, res) {
	if (!req.user) return
	res.cookie('id_token', token.createUserToken(req.user, '48h'), { maxAge: 48 * 3600 * 1000 })
	res.redirect('/')
}

function authenticate(req, res, next) {
	if (req.path.startsWith('/public')) {
		next()
		return
	}
	const wsConnect = req.path.startsWith('/connect')
	token
		.verify(req.cookies['id_token'])
		.then((user) => {
			if (user.game && !wsConnect) {
				res.status(401).send('not authorized')
				return
			}
			req.user = user
			next()
		})
		.catch(() => {
			if (wsConnect) {
				res.status(401).send('not authorized')
				return
			}
			res.redirect('/public/')
		})
}

module.exports = {
	register,
	authenticate,
	passport,
}
