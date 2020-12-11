const app = require('express')()

const helmet = require('helmet')
helmet.featurePolicy
app.use(helmet({ contentSecurityPolicy: false }))

var cookieParser = require('cookie-parser')
app.use(cookieParser())

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

module.exports = app