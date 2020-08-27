"use strict";

/** @module perry-rylance/event */

export default class Event
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