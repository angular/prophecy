var traceurRequire = require('../node_modules/traceur/src/node/require');
var Promise = traceurRequire('./test/MockPromise.js').MockPromise;

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
