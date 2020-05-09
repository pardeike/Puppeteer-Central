function TransformRecognizer(element, dcb) {
	const Gestures = {
		NONE: 0,
		ROTATE: 1,
		SCALE: 2,
		CLICK: 3,
		DRAG: 4,
	}

	const Thresholds = {
		SCALE: 0.2, // percentage difference.
		ROTATION: 5, // degrees.
	}

	let startTouch = undefined
	let referencePair = undefined
	let touchDelay = undefined
	let currentGesture = Gestures.NONE
	const touchDuration = 900
	const debugCallback = dcb

	let callbacks = {
		short: (_) => {},
		long: (_) => {},
		move: (_) => {},
		rotate: (_) => {},
		scale: (_) => {},
		stop: () => {},
		wheel: (_) => {},
		context: (_) => {},
	}

	TransformRecognizer.prototype.onEvent = (eventName, cb) => {
		callbacks[eventName] = cb
	}

	const touchStartHandler = (e) => {
		e.preventDefault()
		const touches = e.touches
		if (touches.length == 1) {
			startTouch = new Touch(e, touches[0].pageX, touches[0].pageY)
			currentGesture = Gestures.CLICK
			touchDelay = setTimeout(() => {
				if (debugCallback) debugCallback(`long ${startTouch.x} ${startTouch.y}`)
				callbacks.long({ x: startTouch.x, y: startTouch.y })
				currentGesture = Gestures.NONE
			}, touchDuration)
		}
		if (touches.length == 2) {
			referencePair = new TouchPair(e, touches)
		}
		return false
	}

	const mouseStartHandler = (e) => {
		e.preventDefault()
		startTouch = new Touch(undefined, e.offsetX, e.offsetY)
		currentGesture = Gestures.CLICK
		return false
	}

	const touchMoveHandler = function (e) {
		e.preventDefault()
		const touches = e.touches
		if (touches.length == 1) {
			const currentTouch = new Touch(e, touches[0].pageX, touches[0].pageY)
			const move = {
				x: currentTouch.x - startTouch.x,
				y: currentTouch.y - startTouch.y,
			}
			if (Math.abs(move.x) > 3 || Math.abs(move.y) > 3) currentGesture = Gestures.DRAG
			if (debugCallback) debugCallback(`move ${move.x} ${move.y}`)
			callbacks.move(move)
			if (Math.abs(move.x) > 3 || Math.abs(move.y) > 3) clearTimeout(touchDelay)
			return false
		}
		if (touches.length == 2) {
			const currentPair = new TouchPair(e, touches)
			const angle = currentPair.angleSince(referencePair)
			const scale = currentPair.scaleSince(referencePair)

			if (currentGesture == Gestures.NONE) {
				if (angle > Thresholds.ROTATION || -angle > Thresholds.ROTATION) {
					currentGesture = Gestures.ROTATE
				} else if (scale > 1 + Thresholds.SCALE || scale < 1 - Thresholds.SCALE) {
					currentGesture = Gestures.SCALE
				}
			}
			const center = currentPair.center()
			if (currentGesture == Gestures.ROTATE) {
				if (debugCallback) debugCallback(`rotate ${angle} ${center.x} ${center.y}`)
				callbacks.rotate({
					rotation: angle,
					x: center.x,
					y: center.y,
				})
			}
			if (currentGesture == Gestures.SCALE) {
				if (debugCallback) debugCallback(`scale ${scale} ${center.x} ${center.y}`)
				callbacks.scale({
					scale: scale,
					x: center.x,
					y: center.y,
				})
			}
		}
		return false
	}

	const mouseMoveHandler = (e) => {
		e.preventDefault()
		if (currentGesture != Gestures.CLICK && currentGesture != Gestures.DRAG) return
		const currentTouch = new Touch(undefined, e.offsetX, e.offsetY)
		const x = currentTouch.x - startTouch.x
		const y = currentTouch.y - startTouch.y
		if (Math.abs(x) > 3 || Math.abs(y) > 3) currentGesture = Gestures.DRAG
		if (debugCallback) debugCallback(`move ${x} ${y}`)
		callbacks.move({ x, y })
		return false
	}

	const touchEndHandler = (e) => {
		e.preventDefault()
		const touches = e.touches
		clearTimeout(touchDelay)
		if (touches.length < 2) {
			if (currentGesture == Gestures.CLICK) {
				if (debugCallback) debugCallback(`short ${startTouch.x} ${startTouch.y} ${0}`)
				callbacks.short({ x: startTouch.x, y: startTouch.y, btn: 0 })
			}
			currentGesture = Gestures.NONE
		}
		if (debugCallback) debugCallback(`stop`)
		callbacks.stop()
		return false
	}

	const mouseEndHandler = (e) => {
		e.preventDefault()
		if (currentGesture == Gestures.CLICK) {
			if (debugCallback) debugCallback(`short ${startTouch.x} ${startTouch.y} ${e.button}`)
			callbacks.short({ x: startTouch.x, y: startTouch.y, btn: e.button })
		}
		currentGesture = Gestures.NONE
		if (debugCallback) debugCallback(`stop`)
		callbacks.stop()
		return false
	}

	const wheelHandler = (e) => {
		e.preventDefault()
		if (debugCallback) debugCallback(`wheel ${e.deltaX} ${e.deltaY}`)
		callbacks.wheel({
			x: e.deltaX,
			y: e.deltaY,
		})
		return false
	}

	const contextMenuHandler = (e) => {
		e.preventDefault()
		if (debugCallback) debugCallback(`context ${e.clientX} ${e.clientY} ${e.shiftKey}`)
		callbacks.context({
			x: e.clientX,
			y: e.clientY,
			shift: e.shiftKey,
		})
		return false
	}

	element.addEventListener('touchstart', touchStartHandler, { capture: true, passive: false })
	element.addEventListener('touchmove', touchMoveHandler, { capture: true, passive: false })
	element.addEventListener('touchend', touchEndHandler, { capture: true, passive: false })
	element.addEventListener('mousedown', mouseStartHandler, { capture: true, passive: false })
	element.addEventListener('mousemove', mouseMoveHandler, { capture: true, passive: false })
	element.addEventListener('mouseup', mouseEndHandler, { capture: true, passive: false })
	element.addEventListener('mouseleave', mouseEndHandler, { capture: true, passive: false })
	element.addEventListener('mouseout', mouseEndHandler, { capture: true, passive: false })
	element.addEventListener('wheel', wheelHandler, { capture: true, passive: false })
	element.addEventListener('contextmenu', contextMenuHandler, { capture: true, passive: false })
}

function TouchPair(e, touchList) {
	this.t1 = new Touch(e, touchList[0].pageX, touchList[0].pageY)
	this.t2 = new Touch(e, touchList[1].pageX, touchList[1].pageY)
}

TouchPair.prototype.angleSince = function (referencePair) {
	// TODO: handle the edge case of going between 0 and 360.
	// eg. the difference between 355 and 0 is 5.
	return this.angle() - referencePair.angle()
}

TouchPair.prototype.scaleSince = function (referencePair) {
	return this.span() / referencePair.span()
}

TouchPair.prototype.center = function () {
	const x = (this.t1.x + this.t2.x) / 2
	const y = (this.t1.y + this.t2.y) / 2
	return new Touch(undefined, x, y)
}

TouchPair.prototype.span = function () {
	const dx = this.t1.x - this.t2.x
	const dy = this.t1.y - this.t2.y
	return Math.sqrt(dx * dx + dy * dy)
}

TouchPair.prototype.angle = function () {
	const dx = this.t1.x - this.t2.x
	const dy = this.t1.y - this.t2.y
	return (Math.atan2(dy, dx) * 180) / Math.PI
}

function Touch(e, x, y) {
	if (e) {
		x -= e.target.x
		y -= e.target.y
	}
	this.x = x
	this.y = y
}

export default TransformRecognizer
