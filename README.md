# Angular 2.0 Deferred/Promise

## Status: In-Development

This project makes available an ES6 `Deferred` implementation, using
[ES6 `Promises`](https://github.com/domenic/promises-unwrapping).
Also included is a utility mock implementation of `Promise` with a corresponding
`PromiseBackend` which allows flushing of the `Promise`'s underlying microtask
queue, allowing developers to write synchronous tests against Promise-based
libraries.

## Install

`$ npm install --save angular/deferred`

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
//Logs "done" to the console in 1 second
```

Example with `Deferred` without using PromiseMock:
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

### Deferred Instance Methods and Properties

| name           | description |
| -------------- | ----------- |
| resolve(value) | Alias to `promise.resolve()` |
| reject(reason) | Alias to `promise.reject()` |
| promise        | `Promise` instance, used to chain actions to be executed upon fulfillment of the promise |

## PromiseMock Module (For Testing)

The `PromiseMock` module contains two classes that allow synchronous testing of
promise-based APIs. The `PromiseBackend` class provides methods to register and
unregister the `PromiseMock` class as the global `Promise` constructor, as well
as methods to flush the queue of pending operations registered by the
`PromiseMock`. The `PromiseMock` implementation is exactly the same as the
native/Traceur ES6 `Promise`, except that it adds its pending tasks to the
flushable `PromiseBackend` queue instead of a hidden microtask queue.

Example test of `Deferred` using `PromiseBackend`:
```javascript
import {PromiseBackend} from './node_modules/deferred/src/PromiseMock';
import {Deferred} from './node_modules/deferred/src/Deferred';
describe('.resolve()', function() {
  it('should call the resolver\'s resolve function with the correct value',
    function() {
      var resolveSpy = jasmine.createSpy('resolveSpy');
      PromiseBackend.forkZone().run(function() {
        var deferred = new Deferred();
        deferred.promise.then(resolveSpy);
        deferred.resolve('Flush me!');
        PromiseBackend.flush(true);
      });

      expect(resolveSpy).toHaveBeenCalledWith('Flush me!');
  });
});
```

### PromiseBackend

The `PromiseBackend` class is completely static. This
class manages the process of patching the global object with
`PromiseMock` as well as flushing any pending promise fulfillment operations.
The PromiseBackend keeps a single queue of pending tasks, which is shared
by all promises.

The PromiseBackend provides a convenience method to create a zone within
which tests can be executed, which will automatically patch and unpatch
`window.Promise`. The zone will also verify that no outstanding requests are
waiting to be flushed.
```javascript
beforeEach(function() {
  //No need for PromiseBackend.patchWithMock(), or an afterEach() to unpatch
  this.zone = PromiseBackend.forkZone();
});
it('should resolve with a smiley', function() {
  this.zone.run(function() {
    var resolveSpy = jasmine.createSpy();
    var backend = new PromiseBackend();
    new Promise(function(resolve) {
      resolve(':)');
    }).
    then(resolveSpy);
    backend.flush();
    expect(resolveSpy).toHaveBeenCalledWith(':)');
  });
})
```

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

With `PromiseMock` and `PromiseBackend.flush()`, this same test can be expressed
as:
```javascript
it('should resolve with a smiley', function() {
  var resolveSpy = jasmine.createSpy();
  PromiseBackend.forkZone().run(function() {
    new Promise(function(resolve) {
      resolve(':)');
    }).
    then(resolveSpy);
    PromiseBackend.flush(true);
  });

  expect(resolveSpy).toHaveBeenCalledWith(':)');
});
```

####  PromiseBackend Methods and Properties

| name                         | description |
| ---------------------------- | ----------- |
| static setGlobal(global:Object)     | global context to which the native implementation of `Promise` is attached (default: window) |
| static flush(recursiveFlush=false)  | Flushes all tasks that have been queued for execution. If recursiveFlush is true, the backend will continue flushing until the queue is empty, including tasks that have been added since flushing began. Returns the `PromiseBackend` instance to allow chaining. |
| static executeAsap(fn:Function)     | Add a function to the queue to be executed on the next flush |
| static restoreNativePromise()       | Restore the native Promise implementation to the global object |
| static patchWithMock()              | Replace the global Promise constructor with `PromiseMock` |
| static verifyNoOutstandingTasks()   | Throw if tasks are in the queue waiting to flush |
| static zone:forkZone()              | Creates and returns a new zone which automatically patches `window.Promise` with the PromiseMock before execution, and restores the original promise after execution. |
| static queue:Array.&lt;Function&gt; | Array of functions to be executed on next flush, populated by `executeAsap()`. Note that this is undefined until an instance of `PromiseBackend` is created. |
| global:Object                       | The global context within which `PromiseBackend` is operating, default: window |

[Design Doc](https://docs.google.com/a/google.com/document/d/1ksBjyCgwuiEUGn9h2NYQGtmQkP5N9HbehMBgaxMtwfs/edit#) (superceded by implementation in this project).

## TODO

 * Add A+ tests for PromiseMock. This implementation is copied from Traceur
   (which is ported from V8). The Traceur implementation is already passing A+
   tests. This project should have the tests as well.
 * Add src/index.js to export items that should be available at runtime.
 * Add build process
