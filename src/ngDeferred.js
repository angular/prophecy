export class Deferred {
  constructor () {
    var self = this;
    console.log('Promise', Promise);
    this.promise = new Promise(function(resolve, reject) {
      self.resolve = function (value) {
        resolve.call(this, value);
      };
      self.reject = reject;
    });
  }
}
