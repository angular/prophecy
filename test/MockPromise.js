export class MockFulfillment {
  constructor(resolution, value, promise) {
    this.resolution = resolution;
    this.promise = promise;
    if (resolution === 'resolve') {
      this.value = value;
    }
    else {
      this.reason = value;
    }
  }
}

export class MockPromise {
  constructor (resolver) {
    MockPromise.queue = MockPromise.queue || [];
    resolver.call(this, this.internalResolve_, this.internalReject_);
  }

  then (success, failure) {
    this.internalChain_ = this.internalChain_ || [];
    this.internalChain_.push([success, failure]);
    return this;
  }

  internalResolve_ (value) {
    MockPromise.queue.push(new MockFulfillment('resolve', value, this));
  }

  internalReject_ (reason) {
    MockPromise.queue.push(new MockFulfillment('reject', reason, this));
  }

  static flush () {
    MockPromise.queue.forEach(function(fulfillment) {
      var fnIndex = fulfillment.resolution === 'resolve' ? 0 : 1;
      if (fulfillment.promise.internalChain_) {
        fulfillment.promise.internalChain_.forEach(function(chain) {
          chain[fnIndex].call(
              fulfillment.promise,
              fulfillment[fnIndex? 'reason' : 'value']);
        });
      }
    });
  }

  static verifyNothingToFlush () {
    if (MockPromise.queue && MockPromise.queue.length) {
      throw new Error('There are resolutions waiting to be flushed!');
    }
  }
}
