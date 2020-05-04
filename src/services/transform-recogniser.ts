function TransformRecognizer(element) {
	this.startTouch = null
	this.referencePair = null
	this.touchDelay = null
	this.touchDuration = 900

	element.addEventListener('touchstart', this.touchStartHandler.bind(this))
	element.addEventListener('touchmove', this.touchMoveHandler.bind(this))
	element.addEventListener('touchend', this.touchEndHandler.bind(this))
	element.addEventListener('mousedown', this.mouseStartHandler.bind(this))
	element.addEventListener('mousemove', this.mouseMoveHandler.bind(this))
	element.addEventListener('mouseup', this.mouseEndHandler.bind(this))
	element.addEventListener('mouseleave', this.mouseEndHandler.bind(this))
	element.addEventListener('mouseout', this.mouseEndHandler.bind(this))
	this.element = element

	this.callbacks = {
		long: null,
		move: null,
		rotate: null,
		scale: null,
		stop: null,
	}

	this.Gestures = {
		NONE: 0,
		ROTATE: 1,
		SCALE: 2,
		DRAG: 3,
	}

	this.Thresholds = {
		SCALE: 0.2, // percentage difference.
		ROTATION: 5, // degrees.
	}

	this.currentGesture = this.Gestures.NONE
}

TransformRecognizer.prototype.touchStartHandler = function (e) {
	const touches = e.touches
	if (touches.length == 1) {
		this.startTouch = new Touch(touches[0].pageX, touches[0].pageY)
		this.touchDelay = setTimeout(() => {
			this.callbacks.long({ x: this.startTouch.x, y: this.startTouch.y })
		}, this.touchDuration)
	}
	if (touches.length == 2) {
		this.referencePair = new TouchPair(touches)
	}
}

TransformRecognizer.prototype.mouseStartHandler = function (e) {
	this.startTouch = new Touch(e.offsetX, e.offsetY)
	this.currentGesture = this.Gestures.DRAG
}

TransformRecognizer.prototype.touchMoveHandler = function (e) {
	e.preventDefault()
	const touches = e.touches
	if (touches.length == 1) {
		const currentTouch = new Touch(touches[0].pageX, touches[0].pageY)
		const move = {
			x: currentTouch.x - this.startTouch.x,
			y: currentTouch.y - this.startTouch.y,
		}
		this.callbacks.move(move)
		if (Math.abs(move.x) > 3 || Math.abs(move.y) > 3) clearTimeout(this.touchDelay)
		return
	}
	if (touches.length == 2) {
		const currentPair = new TouchPair(touches)
		const angle = currentPair.angleSince(this.referencePair)
		const scale = currentPair.scaleSince(this.referencePair)

		if (this.currentGesture == this.Gestures.NONE) {
			if (angle > this.Thresholds.ROTATION || -angle > this.Thresholds.ROTATION) {
				this.currentGesture = this.Gestures.ROTATE
			} else if (scale > 1 + this.Thresholds.SCALE || scale < 1 - this.Thresholds.SCALE) {
				this.currentGesture = this.Gestures.SCALE
			}
		}
		const center = currentPair.center()
		if (this.currentGesture == this.Gestures.ROTATE) {
			this.callbacks.rotate({
				rotation: angle,
				x: center.x,
				y: center.y,
			})
		}
		if (this.currentGesture == this.Gestures.SCALE) {
			this.callbacks.scale({
				scale: scale,
				x: center.x,
				y: center.y,
			})
		}
	}
}

TransformRecognizer.prototype.mouseMoveHandler = function (e) {
	if (this.currentGesture != this.Gestures.DRAG) return
	const currentTouch = new Touch(e.offsetX, e.offsetY)
	this.callbacks.move({
		x: currentTouch.x - this.startTouch.x,
		y: currentTouch.y - this.startTouch.y,
	})
}

TransformRecognizer.prototype.touchEndHandler = function (e) {
	const touches = e.touches
	clearTimeout(this.touchDelay)
	if (touches.length < 2) {
		this.currentGesture = this.Gestures.NONE
	}
	this.callbacks.stop()
}

TransformRecognizer.prototype.mouseEndHandler = function (e) {
	this.currentGesture = this.Gestures.NONE
	this.callbacks.stop()
}

TransformRecognizer.prototype.onLong = function (callback) {
	this.callbacks.long = callback
}

TransformRecognizer.prototype.onMove = function (callback) {
	this.callbacks.move = callback
}

TransformRecognizer.prototype.onStop = function (callback) {
	this.callbacks.stop = callback
}

TransformRecognizer.prototype.onScale = function (callback) {
	this.callbacks.scale = callback
}

TransformRecognizer.prototype.onRotate = function (callback) {
	this.callbacks.rotate = callback
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
