import React from 'react'

export function Spacer() {
	return <div style={{ height: 10 }} />
}

export function debugValue(obj) {
	if (Array.isArray(obj)) return `[${obj.map((e) => debugValue(e)).join(',')}]`
	if (typeof obj == 'string') return obj
	return `{${Object.keys(obj).join(',')}}`
}
