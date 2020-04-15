const fs = require('fs')
const jwt = require('jsonwebtoken')
const tools = require('./tools')

const publicKey = process.env.SIGN_KEY_PUBLIC || fs.readFileSync('sign.pub.dev')
const privateKey = process.env.SIGN_KEY_PRIVATE || fs.readFileSync('sign.priv.dev')
if (!publicKey || !privateKey) console.log('No signing key found. Please use the script <sign-dev-keys-create.js> to generate a new pair.')

const version = 1

function createUserToken(payload, expiresIn) {
	return jwt.sign({ ...payload, version }, privateKey, { algorithm: 'RS256', expiresIn })
}

function createGameToken(user) {
	const game = tools.randomCode()
	return {
		game,
		token: jwt.sign(
			{
				service: user.service,
				id: user.id,
				name: user.name,
				game,
				version,
			},
			privateKey,
			{ algorithm: 'RS256' }
		),
	}
}

async function verify(token) {
	return new Promise((resolve, reject) => {
		if (!token) {
			reject()
			return
		}
		jwt.verify(token, publicKey, { algorithm: 'RS256' }, function (err, decoded) {
			if (decoded && !err && decoded.version == version) resolve(decoded)
			else reject(err)
		})
	})
}

module.exports = {
	createUserToken,
	createGameToken,
	verify,
}
