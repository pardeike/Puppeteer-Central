import { createStateLink } from '@hookstate/core'
import { Persistence } from '@hookstate/persistence'
import { BSON } from 'bsonfy'

const initialValue = {
	pages: [
		['lobby', 'Lobby'],
		['game', 'Game'],
		['settings', 'Settings'],
	],
	current: 'lobby',
}
const routesRef = createStateLink(initialValue).with(Persistence('puppeteer-pages'))
const pages = routesRef.access().get().pages
const s1 = pages ? BSON.serialize(pages) : undefined
const s2 = initialValue.pages ? BSON.serialize(initialValue.pages) : undefined
if (s1 != s2) routesRef.access().set(initialValue)

export default routesRef
