function TransformRecognizer(element) {
	const Gestures = {
		NONE: 0,
		ROTATE: 1,
		SCALE: 2,
		DRAG: 3,
	}

	const Thresholds = {
		SCALE: 0.2, // percentage difference.
		ROTATION: 5, // degrees.
	}

	let startTouch = null
	let referencePair = null
	let touchDelay = null
	let currentGesture = Gestures.NONE
	const touchDuration = 900

	let callbacks = {
		long: null,
		move: null,
		rotate: null,
		scale: null,
		stop: null,
		wheel: null,
		context: null,
	}

	TransformRecognizer.prototype.onEvent = (eventName, cb) => {
		callbacks[eventName] = cb
	}

	const touchStartHandler = (e) => {
		e.preventDefault()
		const touches = e.touches
		if (touches.length == 1) {
			startTouch = new Touch(touches[0].pageX, touches[0].pageY)
			touchDelay = setTimeout(() => {
				callbacks.long({ x: startTouch.x, y: startTouch.y })
			}, touchDuration)
		}
		if (touches.length == 2) {
			referencePair = new TouchPair(touches)
		}
		return false
	}

	const mouseStartHandler = (e) => {
		e.preventDefault()
		startTouch = new Touch(e.offsetX, e.offsetY)
		currentGesture = Gestures.DRAG
		return false
	}

	const touchMoveHandler = function (e) {
		e.preventDefault()
		const touches = e.touches
		if (touches.length == 1) {
			const currentTouch = new Touch(touches[0].pageX, touches[0].pageY)
			const move = {
				x: currentTouch.x - startTouch.x,
				y: currentTouch.y - startTouch.y,
			}
			callbacks.move(move)
			if (Math.abs(move.x) > 3 || Math.abs(move.y) > 3) clearTimeout(touchDelay)
			return false
		}
		if (touches.length == 2) {
			const currentPair = new TouchPair(touches)
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
				callbacks.rotate({
					rotation: angle,
					x: center.x,
					y: center.y,
				})
			}
			if (currentGesture == Gestures.SCALE) {
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
		if (currentGesture != Gestures.DRAG) return
		const currentTouch = new Touch(e.offsetX, e.offsetY)
		callbacks.move({
			x: currentTouch.x - startTouch.x,
			y: currentTouch.y - startTouch.y,
		})
		return false
	}

	const touchEndHandler = (e) => {
		e.preventDefault()
		const touches = e.touches
		clearTimeout(touchDelay)
		if (touches.length < 2) {
			currentGesture = Gestures.NONE
		}
		callbacks.stop()
		return false
	}

	const mouseEndHandler = (e) => {
		e.preventDefault()
		currentGesture = Gestures.NONE
		callbacks.stop()
		return false
	}

	const wheelHandler = (e) => {
		e.preventDefault()
		callbacks.wheel({
			x: e.deltaX,
			y: e.deltaY,
		})
		return false
	}

	const contextMenuHandler = (e) => {
		e.preventDefault()
		callbacks.context({
			x: e.clientX,
			y: e.clientY,
			shift: e.shiftKey,
		})
		return false
	}

	element.addEventListener('touchstart', touchStartHandler, false)
	element.addEventListener('touchmove', touchMoveHandler, false)
	element.addEventListener('touchend', touchEndHandler, false)
	element.addEventListener('mousedown', mouseStartHandler, false)
	element.addEventListener('mousemove', mouseMoveHandler, false)
	element.addEventListener('mouseup', mouseEndHandler, false)
	element.addEventListener('mouseleave', mouseEndHandler, false)
	element.addEventListener('mouseout', mouseEndHandler, false)
	element.addEventListener('wheel', wheelHandler, false)
	element.addEventListener('contextmenu', contextMenuHandler, false)
}

function TouchPair(touchList) {
	this.t1 = new Touch(touchList[0].pageX, touchList[0].pageY)
	this.t2 = new Touch(touchList[1].pageX, touchList[1].pageY)
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
	return new Touch(x, y)
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

function Touch(x, y) {
	this.x = x
	this.y = y
}

export default TransformRecognizer
