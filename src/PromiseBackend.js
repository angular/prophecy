import {PromiseMock} from './PromiseMock';

export class PromiseBackend {
  constructor () {
  }

  static setGlobal(global) {
    PromiseBackend.queue = [];
    PromiseBackend.global = global || window;
  }

  static flush() {
    var i = PromiseBackend.queue.length, task;
    if (!i) {
      throw new Error('Nothing to flush!');
    }
    while (i--) {
      task = PromiseBackend.queue.shift();
      task.call(null);
    }
  }

  static executeAsap(fn) {
    PromiseBackend.queue.push(fn);
  }

  static restoreNativePromise() {
    PromiseBackend.global.Promise = PromiseBackend.__OriginalPromise__ || PromiseBackend.global.Promise;
  }

  static patchWithMock() {
    PromiseBackend.__OriginalPromise__ = PromiseBackend.global.Promise;
    PromiseBackend.global.Promise = PromiseMock;
  }

  static verifyNoOutstandingTasks() {
    if (PromiseBackend.queue.length) throw new Error('Pending tasks to be flushed');
  }
}

PromiseBackend.global = window;
PromiseBackend.queue = [];
