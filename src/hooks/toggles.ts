import { createStateLink } from '@hookstate/core'
import { Persistence } from '@hookstate/persistence'

const initialValue = {
	settings01: true,
	settings02: true,
	settings03: true,
	settings04: true,
}

const togglesRef = createStateLink(initialValue).with(Persistence('puppeteer-toggles'))
export default togglesRef
