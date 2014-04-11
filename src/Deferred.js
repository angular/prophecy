export class Deferred {
  constructor () {
    this.promise = new Promise(function(resolve, reject) {
      this.resolve_ = resolve;
      this.reject_ = reject;
    }.bind(this));
  }

  resolve (value) {
    //TODO (@jeffbcross): This should probably be called with a null context
    this.resolve_.call(this.promise, value);
  }

  reject (reason) {
    //TODO (@jeffbcross): This should probably be called with a null context
    this.reject_.call(this.promise, reason);
  }
}
