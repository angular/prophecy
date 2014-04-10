import {Inject} from 'di/annotations';
import {InjectablePromise} from './InjectablePromise';

@Inject(InjectablePromise)
export function Deferred (PromiseConstructor) {
  class DeferredConstructor {
    constructor () {
      this.promise = new PromiseConstructor(function(resolve, reject) {
        this.resolve_ = resolve;
        this.reject_ = reject;
      }.bind(this));
    }

    resolve (value) {
      this.resolve_.call(this.promise, value);
    }

    reject (reason) {
      this.reject_.call(this.promise, reason);
    }
  }

  return DeferredConstructor;
}
