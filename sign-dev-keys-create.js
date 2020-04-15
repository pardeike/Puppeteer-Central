const fs = require('fs')
const keypair = require('keypair')

const pair = keypair()
fs.writeFileSync(pair.private, 'sign.priv.dev')
fs.writeFileSync(pair.public, 'sign.pub.dev')
