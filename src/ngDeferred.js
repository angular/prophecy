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
