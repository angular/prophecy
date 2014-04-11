# Angular 2.0 Deferred/Promise

## Status: In-Development

This project makes available an ES6 `Deferred` implementation, using
[ES6 `Promise`](https://github.com/domenic/promises-unwrapping).
Also included is a utility mock implementation of `Promise` with a corresponding
`PromiseBackend` which allows flushing of the `Promise`'s underlying microtask
queue, allowing developers to write synchronous tests against Promise-based
libraries.

## Install

`$ npm install --save jeffbcross/deferred`

## Deferred

The `Deferred` class is a small wrapper around `Promise` which lifts the
requirement of resolving the promise within the resolver function that gets
passed to the `Promise` constructor.

Example with vanilla `Promise`:
```javascript
var promise = new Promise(function(resolve, reject) {
  setTimeout(function() {
    resolve('done');
  }, 1000);
});
promise.then(function(val) {
  console.log(val);
});
//Logs "done" to the console in 1 secondn
```

Example with `Deferred`:
```javascript
import {Deferred} from './node_modules/deferred/src/Deferred';
var deferred = new Deferred();
deferred.promise.then(function(val) {
  console.log(val);
});
setTimeout(function() {
  deferred.resolve('done');
}, 1000);
//Logs "done" to the console in 1 secondn
```

### `Deferred` Instance Methods and Properties

| name           | description |
| -------------- | ----------- |
| resolve(value) | Alias to `promise.resolve()` |
| reject(reason) | Alias to `promise.reject()` |
| promise        | `Promise` instance, used to chain actions to be executed upon fulfillment of the promise |

## PromiseMock Module (For Testing)

The `PromiseMock` module contains two classes that allow synchronous testing of
promise-based APIs. The `PromiseBackend` class provides methods to register and
unregister the `MockPromise` class as the global `Promise` constructor, as well
as methods to flush the queue of pending operations registered by the
`MockPromise`. The `MockPromise` implementation is exactly the same as the
native/Traceur ES6 `Promise`, except that it adds its pending tasks to the
flushable `PromiseBackend` queue instead of a hidden microtask queue.

Example test of `Deferred` using `PromiseBackend`:
```javascript
import {PromiseBackend} from './node_modules/deferred/src/PromiseMock';
import {Deferred} from './node_modules/deferred/src/Deferred';
...
it('should call the resolver\'s resolve function with the correct value', function() {
  //Replace window.Promise with MockPromise constructor
  PromiseBackend.patchWithMock();
  var resolveSpy = jasmine.createSpy();
  var deferred = new Deferred();
  deferred.promise.then(resolveSpy);
  deferred.resolve('Flush me!');
  PromiseBackend.flush();
  expect(resolveSpy).toHaveBeenCalledWith('Flush me!');
  //Restore window.Promise with the native Promise implementation
  PromiseBackend.restoreNativePromise();
});
...
```

### `PromiseBackend`

The `PromiseBackend` class is completely static (no instance methods or
properties), and manages the process of patching the global object with
`MockPromise` as well as flushing any pending promise fulfillment operations.

The `flush` method is called in lieu of waiting for the next VM turn, and
prevents the need for writing async tests using `setTimeout`. Example writing
an test that waits for an async operation with `setTimeout`:
```javascript
it('should resolve with a smiley', function(done) {
  var resolveSpy = jasmine.createSpy();
  new Promise(function(resolve) {
    resolve(':)');
  }).
  then(resolveSpy);
  setTimeout(function() {
    expect(resolveSpy).toHaveBeenCalledWith(':)');
    done();
  }, 0);
});
```

With `MockPromise` and `PromiseBackend.flush()`, this same test can be expressed
as:
```javascript
it('should resolve with a smiley', function() {
  var resolveSpy = jasmine.createSpy();
  new Promise(function(resolve) {
    resolve(':)');
  }).
  then(resolveSpy);
  PromiseBackend.flush();
  expect(resolveSpy).toHaveBeenCalledWith(':)');
});
```

####  `PromiseBackend` Static Methods and Properties

| name                       | description |
| -------------------------- | ----------- |
| setGlobal(global:Object)   | global context to which the native implementation of `Promise` is attached (default: window) |
| flush()                    | Flushes all tasks that have been queued for execution |
| executeAsap(fn:Function)   | Add a function to the queue to be executed on the next flush |
| restoreNativePromise()     | Restore the native Promise implementation to the global object |
| patchWithMock() | Replace the global Promise constructor with `PromiseMock` |
| verifyNoOutstandingTasks() | Throw if tasks are in the queue waiting to flush |
| queue:Array.&lt;Function&gt;     | Array of functions to be executed on next flush, populated by executeAsap() |
| global:Object              | The global context within which PromiseBackend is operating, default: window |

[Design Doc](https://docs.google.com/a/google.com/document/d/1ksBjyCgwuiEUGn9h2NYQGtmQkP5N9HbehMBgaxMtwfs/edit#) (superceded by implementation in this project).

## TODO

 * Add A+ tests for PromiseMock. This implementation is copied from Traceur
   (which is ported from V8). The Traceur implementation is already passing A+
   tests. This project should have the tests as well.
 * Add src/index.js to export items that should be available at runtime.
 * Add build process
