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
    resolver.call(this, this.internalResolve_.bind(this), this.internalReject_.bind(this));
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
      var oneReject;
      var fnIndex = fulfillment.resolution === 'resolve' ? 0 : 1;
      if (fulfillment.promise.internalChain_) {
        var fulfillmentTuple = fulfillment.promise.internalChain_.shift();
        if (Array.isArray(fulfillmentTuple)) {
          evalChainItem(
              fulfillmentTuple,
              fulfillment[fnIndex? 'reason' : 'value']);
        }
      }

      function evalChainItem (item, value) {
          var nextValue = value;
          if (oneReject && typeof item[1] === 'function') {
            oneReject = false;
            nextValue = callAndReturn(item[1]);
          }
          else if (typeof item[fnIndex] === 'function') {
            nextValue = callAndReturn(item[fnIndex]);
          }

          if(nextValue && typeof nextValue.then === 'function') {
            //do something fancy
            //Should it be required to flush again since a new promise
            //needs to be resolved?
          }
          else {
            var fulfillmentTuple = fulfillment.promise.internalChain_.shift();

            if (Array.isArray(fulfillmentTuple)) {
              evalChainItem(
                  fulfillmentTuple,
                  fulfillment[fnIndex? 'reason' : 'value']);
            }
          }

          function callAndReturn (fn) {
            var retValue;
            try {
              retValue = fn.call(
                undefined,
                value) || value;
            }
            catch (e) {
              oneReject = true;
              retValue = e;
            }

            return retValue;
          }
        }
    });
  }

  static verifyNothingToFlush () {
    if (MockPromise.queue && MockPromise.queue.length) {
      throw new Error('There are resolutions waiting to be flushed!');
    }
  }

  static resolve (value) {
    return new MockPromise(function(resolve){
      resolve(value);
    });
  }

  static reject (reason) {
    return new MockPromise(function(resolve, reject) {
      reject(reason);
    });
  }
}
