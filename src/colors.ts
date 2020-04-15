import tools from './tools'

const luminance = (color) => {
	const [r, g, b] = color
	return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))
}

const bwContrast = (color) => {
	return luminance(color) > 127.5 ? 'black' : 'white'
}

const contrastColor = (color, f = undefined) => {
	if (color[0] == 255 && color[1] == 255 && color[2] == 255) return [0, 0, 0]
	return transformColor(color, f ? f : (c) => c)
}

const transformColor = (color, f) => {
	return [tools.boxValue(f(color[0], 0), 0, 255), tools.boxValue(f(color[1], 1), 0, 255), tools.boxValue(f(color[2], 2), 0, 255)]
}

const saturateColor = (color, s) => {
	if (color[0] == color[1] && color[1] == color[2]) return color
	let min = color.indexOf(Math.min.apply(null, color))
	const max = color.indexOf(Math.max.apply(null, color))
	const mid = [0, 1, 2].filter((i) => i !== min && i !== max)[0]
	let a = color[max] - color[min]
	const b = color[mid] - color[min]
	const x = color[max]
	const arr = [x, x, x]
	if (min === max) {
		min = 2
		a = 1
	}
	arr[max] = x
	arr[min] = Math.round(x * (1 - s))
	arr[mid] = Math.round(x * (1 - s + (s * b) / a))
	return arr
}

const rgb = (color) => {
	return `rgb(${color[0]},${color[1]},${color[2]})`
}

export default {
	luminance,
	bwContrast,
	contrastColor,
	transformColor,
	saturateColor,
	rgb,
}
