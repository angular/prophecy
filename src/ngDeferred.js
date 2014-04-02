/**
 * TODO (jeffbcross): patch DI to allow injecting Promise in conjunction
 * with calling `new Deferred`, so that Promise can be Mocked with DI.
 */
export class Deferred {
  constructor () {
    this.promise = new Promise(function(resolve, reject) {
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
