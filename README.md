# EventDispatcher
A JavaScript event dispatcher which supports bubbling and capture phases, and bubbling up the DOM tree.

This library is intended to be used with NPM / ES6 projects.

## Installation
I recommend installing this library via NPM

`npm install @perry-rylance/event-dispatcher`

## Usage
Any class which `extends EventDispatcher` can use the following methods

- addEventListener / on
- removeEventListener / off
- dispatchEvent / trigger / emit
- hasEventListener

## Bubbling
When an object emits an event, the event dispatcher will look for a `parent` property on the object.

The dispatcher will then traverse up the ancestors of the object this way, until no more `parent` is found.

In the absense of a `parent`, if the dispatcher finds a property named `element`, then a DOM event will be dispatched on the element via jQuery (please note that jQuery is required to drive this behaviour). This is useful for events emitted from an object with no DOM representation, such as a sprite on a canvas, which you may wish to listen for on the DOM tree - for instance a click event on your sprite.

When an event bubbles up to the DOM, a namespace suffix is added, for instance `click.ed`. The default suffix is `ed`. You can change this by altering `EventDispatcher.domNamespaceSuffix`, or by passing the `domNamespaceSuffix` in the constructor options for individual event dispatchers, if you so wish.