const fs = require('fs')
const keypair = require('keypair')

const pair = keypair()
fs.writeFileSync('sign.priv.dev', pair.private)
fs.writeFileSync('sign.pub.dev', pair.public)
