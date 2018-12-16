/**
 * addEventListener options
 */
let _isSupportsOptions = false

window.addEventListener('test', null, {
  get once() {
    _isSupportsOptions = true
    return false
  }
})

if (!_isSupportsOptions) {
  const _addEventListener = Node.prototype.addEventListener
  const _removeEventListener = Node.prototype.removeEventListener
  const _preventDefault = Event.prototype.preventDefault

  const _addFn = function(eventType, listener, options = false) {
    const _target = this
    const _isObj = typeof options === 'object'
    const _capture = _isObj && 'capture' in options && options.capture === true
    const _once = _isObj && 'once' in options && options.once === true
    const _passive = _isObj && 'passive' in options && options.passive === true
    ;({
      handleEvent: function(e) {
        if (_once) {
          _removeEventListener.call(_target, eventType, this, _capture)
        }
        e.__passive = _passive
        if (typeof listener === 'function') {
          listener(e)
        } else if ('add' in listener) {
          listener.handleEvent(e)
        }
      },
      add: function() {
        _addEventListener.call(_target, eventType, this, _capture)
      }
    }.add())
  }

  const _removeFn = function(eventType, listener, options = false) {
    const _target = this
    const _capture =
      typeof options === 'object' &&
      'capture' in options &&
      options.capture === true
    _removeEventListener.call(_target, eventType, listener, _capture)
  }

  const _preventDefaultFn = function() {
    if (this.__passive) {
      console.error(
        'Unable to preventDefault inside passive event listener invocation'
      )
      return
    }
    _preventDefault.apply(this)
  }

  Object.defineProperty(Node.prototype, 'addEventListener', {
    get: function() {
      return _addFn
    }
  })

  Object.defineProperty(Node.prototype, 'removeEventListener', {
    get: function() {
      return _removeFn
    }
  })

  Object.defineProperty(Event.prototype, 'preventDefault', {
    get: function() {
      return _preventDefaultFn
    }
  })
}
