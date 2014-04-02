export class MockPromise {
  constructor (resolver) {
    MockPromise.queue = MockPromise.queue || [];
    resolver.call(this, this.internalResolve_, this.internalReject_);
  }

  then (success, failure) {
    return this;
  }

  internalResolve_ (value) {
    MockPromise.queue.push({resolution: 'resolve', value: value});
  }

  internalReject_ (reason) {
    MockPromise.queue.push({resolution: 'reject', reason: reason});
  }

  static flush () {
    console.log(MockPromise.queue);
  }

  static verifyNothingToFlush () {
    if (MockPromise.queue && MockPromise.queue.length) {
      throw new Error('There are resolutions waiting to be flushed!');
    }
  }
}
