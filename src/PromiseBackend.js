import {PromiseMock} from './PromiseMock';

export class PromiseBackend {
  constructor (global) {
    this.queue = [];
    this.global = global || window;
  }

  flush() {
    var i = this.queue.length, task;
    if (!i) {
      throw new Error('Nothing to flush!');
    }
    while (i--) {
      task = this.queue.shift();
      task.call(null);
    }
  }

  executeAsap(fn) {
    this.queue.push(fn);
  }

  restoreNative() {
    this.global.Promise = this.__OriginalPromise__ || this.global.Promise;
  }

  patchWithMock() {
    this.__OriginalPromise__ = this.global.Promise;
    this.global.Promise = PromiseMock;
  }

  verifyNoOutstandingTasks() {
    if (this.queue.length) throw new Error('Pending tasks to be flushed');
  }
}
