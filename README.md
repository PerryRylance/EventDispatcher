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

