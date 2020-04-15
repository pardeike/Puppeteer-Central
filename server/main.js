require('./services/env').default
const responseCache = require('./services/cache')

const app = require('./services/app')
// unused for now: const asyncHandler = require('express-async-handler')
const errorHandler = require('./services/error')
const auth = require('./services/auth')
const misc = require('./routes/misc')
const connectWS = require('./routes/connect')
const { connectDB } = require('./services/storage')

auth.register(app)

// --- public routes -----------------------------
// also everything with /public prefix is included

app.get('/logout', (_req, res) => res.clearCookie('id_token').redirect('/'))

app.use(auth.authenticate)

// -- private routes -----------------------------

app.use(require('express').static('www'))
require('express-ws')(app)

app.get('/game-token', misc.gameToken)
app.get('/streamers', misc.availableStreamers)
app.get('/viewers', misc.viewers)
app.get('/youtube-preview/:id', responseCache('image/jpeg'), misc.youtubePreview)
app.ws('/connect', connectWS)

app.use(errorHandler)

console.log('Starting')
connectDB().then(() => {
	console.log('Database connected')
	app.listen(process.env.PORT, () => console.log(`Server listening on ${process.env.PORT}`))
})
