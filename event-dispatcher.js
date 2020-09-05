/** @module perry-rylance/event */

class Event
{
	constructor(options)
	{
		if(typeof options == "string")
			this.type = options;
		
		this.bubbles		= true;
		this.cancelable		= true;
		this.phase			= Event.PHASE_CAPTURE;
		this.target			= null;
		
		this._cancelled = false;
		
		if(typeof options == "object")
			for(var name in options)
				this[name] = options[name];
	}
	
	/**
	 * Prevents any further propagation of the event
	 */
	stopPropagation()
	{
		this._cancelled = true;
	}
}

Event.CAPTURING_PHASE		= 0;
Event.AT_TARGET				= 1;
Event.BUBBLING_PHASE		= 2;

/** @module perry-rylance/event-dispatcher */

class EventDispatcher
{
	constructor(options)
	{
		this.domNamespaceSuffix = EventDispatcher.domNamespaceSuffix;
		
		if(!options)
			options = {};
		
		if(options.domNamespaceSuffix)
			this.domNamespaceSuffix = options.domNamespaceSuffix;
		
		this._listenersByType = {};
	}
	
	/**
	 * Adds an event listener on this object
	 * @param {string} type The event type, or multiple types separated by spaces
	 * @param {function} callback The callback to call when the event fires
	 * @param {object} [thisObject] The object to use as "this" when firing the callback
	 * @param {bool} [useCapture] If true, fires the callback on the capture phase, as opposed to bubble phase
	 * @return {EventDispatcher} This event dispatcher
	 */
	addEventListener(type, listener, thisObject, useCapture)
	{
		var types = type.split(/\s+/);
		if(types.length > 1)
		{
			for(var i = 0; i < types.length; i++)
				this.addEventListener(types[i], listener, thisObject, useCapture);
			
			return this;
		}
		
		if(!(listener instanceof Function))
			throw new Error("Listener must be a function");

		var target;
		if(!this._listenersByType.hasOwnProperty(type))
			target = this._listenersByType[type] = [];
		else
			target = this._listenersByType[type];
		
		var obj = {
			listener: listener,
			thisObject: (thisObject ? thisObject : this),
			useCapture: (useCapture ? true : false)
			};
			
		target.push(obj);
		
		return this;
	}
	
	/**
	 * Removes event listeners from this object
	 * @param {string} type The event type to remove listeners from
	 * @param {function} [listener] The function to remove. If omitted, all listeners will be removed
	 * @param {object} [thisObject] Use the parameter to remove listeners bound with the same thisObject
	 * @param {bool} [useCapture] Remove the capture phase event listener. Otherwise, the bubble phase event listener will be removed.
	 * @return {EventDispatcher} This event dispatcher
	 */
	removeEventListener(type, listener, thisObject, useCapture)
	{
		var arr, index, obj;

		if(!(arr = this._listenersByType[type]))
			return this;
			
		if(!thisObject)
			thisObject = this;
			
		useCapture = (useCapture ? true : false);
		
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
		
			if((arguments.length == 1 || obj.listener == listener) && obj.thisObject == thisObject && obj.useCapture == useCapture)
			{
				arr.splice(i, 1);
				return this;
			}
		}
		
		return this;
	}
	
	/**
	 * Test for listeners of type on this object
	 * @param {string} type The event type to test for
	 * @return {bool} True if this object has listeners bound for the specified type
	 */
	hasEventListener(type)
	{
		return (this._listenersByType[type] ? true : false);
	}
	
	/**
	 * Fires an event on this object
	 * @param {string|Event} event Either the event type as a string, or an instance of Event
	 * @return {EventDispatcher} This event dispatcher
	 */
	dispatchEvent(event)
	{
		if(!(event instanceof Event))
		{
			if(typeof event == "string")
				event = new Event(event);
			else
			{
				var src = event;
				event = new Event();
				for(var name in src)
					event[name] = src[name];
			}
		}

		event.target = this;
			
		var path = [];
		for(var obj = this.parent; obj != null; obj = obj.parent)
			path.unshift(obj);
		
		event.phase = Event.CAPTURING_PHASE;
		for(var i = 0; i < path.length && !event._cancelled; i++)
			path[i]._triggerListeners(event);
			
		if(event._cancelled)
			return this;
			
		event.phase = Event.AT_TARGET;
		this._triggerListeners(event);
			
		event.phase = Event.BUBBLING_PHASE;
		for(i = path.length - 1; i >= 0 && !event._cancelled; i--)
			path[i]._triggerListeners(event);
		
		// Native DOM event
		var topMostElement = this.element;
		for(var obj = this.parent; obj != null; obj = obj.parent)
		{
			if(obj.element)
				topMostElement = obj.element;
		}
		
		if(topMostElement)
		{
			var customEvent = {};
			
			for(var key in event)
			{
				var value = event[key];
				
				if(key == "type")
					value += "." + this.domNamespaceSuffix;
				
				customEvent[key] = value;
			}
			
			$(topMostElement).trigger(customEvent);
		}
		
		return this;
	}
	
	/**
	 * @see addEventListener
	 */
	on()
	{
		return this.addEventListener.apply(this, arguments);
	}
	
	/**
	 * @see removeEventListener
	 */
	off()
	{
		return this.removeEventListener.apply(this, arguments);
	}
	
	/**
	 * @see dispatchEvent
	 */
	trigger()
	{
		return this.dispatchEvent.apply(this, arguments);
	}
	
	/**
	 * @see dispatchEvent
	 */
	emit()
	{
		return this.dispatchEvent.apply(this, arguments);
	}
	
	/**
	 * This method will call bound listeners for the given event. This should be treated as private and never be called externally.
	 * @private
	 */
	_triggerListeners(event)
	{
		var arr, obj;
	
		if(!(arr = this._listenersByType[event.type]))
			return;
		
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
			
			if(event.phase == Event.CAPTURING_PHASE && !obj.useCapture)
				continue;
				
			obj.listener.call(arr[i].thisObject, event);
		}
	}
}

EventDispatcher.domNamespaceSuffix = "ed";

module.exports = Event;
module.exports = EventDispatcher;