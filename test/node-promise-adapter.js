var traceurRequire = require('../node_modules/traceur/src/node/require');
var Promise = traceurRequire('./test/MockPromise.js').MockPromise;

var realInternalResolve = Promise.prototype.internalResolve_;
Promise.prototype.internalResolve_ = function(value) {
  realInternalResolve.call(this, value);
  setTimeout(Promise.flush, 0);
}

var realInternalReject = Promise.prototype.internalReject_;
Promise.prototype.internalReject_ = function(value) {
  realInternalReject.call(this, value);
  setTimeout(Promise.flush, 0);
}

var realResolve = Promise.resolve;
Promise.resolve = function(value) {
  setTimeout(Promise.flush, 0);
  return realResolve(value);
}

var realReject = Promise.reject;
Promise.reject = function(value) {
  setTimeout(Promise.flush, 0);
  return realReject(value);
}

exports.deferred = function () {
  var resolve, reject;
  var promise = new Promise(function(res, rej) {
    resolve = res;
    reject = rej;
  });

  return {
    promise: promise,
    resolve: resolve,
    reject: reject
  };
};

exports.resolved = Promise.resolve.bind(Promise);

exports.rejected = Promise.reject.bind(Promise);
