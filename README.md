# Angular 2.0 Deferred/Promise

This project makes available an injectable ES6 `Deferred` implementation, using
ES6 `Promise`.


## Install

`$ npm install jeffbcross/deferred`

## Deferred


## PromiseMock (For Testing)

### `PromiseBackend`

####  `PromiseBackend` Static Methods

| name                       | description |
| -------------------------- | ----------- |
| setGlobal(global:object)   | global context to which the native implementation of `Promise` is attached (default: window) |
| flush()                    | Flushes all tasks that have been queued for execution |
| executeAsap(fn:function)   | Add a function to the queue to be executed on the next flush |
| restoreNativePromise()     | Restore the native Promise implementation to the global object |
| patchWithMock() | Replace the global Promise constructor with `PromiseMock` |
| verifyNoOutstandingTasks() | Throw if tasks are in the queue waiting to flush |

### `PromiseBackend` Static Properties

| name                   | description |
| ---------------------- | ----------- |
| queue:Array.<Function> | Array of functions to be executed on next flush, populated by executeAsap() |
| global:Object          | The global context within which PromiseBackend is operating, default: window |

[Design Doc](https://docs.google.com/a/google.com/document/d/1ksBjyCgwuiEUGn9h2NYQGtmQkP5N9HbehMBgaxMtwfs/edit#) (superceded by implementation in this project).

## TODO

 * Add A+ tests for PromiseMock. This implementation is copied from Traceur, which is already passing A+ tests. This project should have the tests as well.
