import {Deferred} from '../src/ngDeferred';

describe('Deferred', function() {
  var RealPromise = Promise,
      mockResolve,
      mockReject;

  function mockGlobalPromise() {
    mockResolve = jasmine.createSpy();
    mockReject = jasmine.createSpy();
    Promise = function (resolver) {
      resolver.call(this, mockResolve, mockReject);
    };
    Promise.prototype.then = jasmine.createSpy();
  }

  function restoreGlobalPromise() {
    Promise = RealPromise;
  }

  describe('constructor', function() {
    it('should have a promise after constructing', function() {
      expect(new Deferred().promise).toBePromiseLike();
    });
  });

  describe('.resolve()', function() {
    beforeEach(mockGlobalPromise);
    afterEach(restoreGlobalPromise);

    it('should call the resolver\'s resolve function with the correct value \
      and context', function() {
      var deferred = new Deferred();
      deferred.resolve('value');
      expect(mockResolve).toHaveBeenCalledWith('value');
      expect(mockResolve.calls.all()[0].object).toBePromiseLike();
    });
  });


  describe('.reject()', function() {
    beforeEach(mockGlobalPromise);
    afterEach(restoreGlobalPromise);

    it('should call the resolver\'s reject function with the correct value \
      and context', function() {
      var deferred = new Deferred();
      deferred.reject('reason');
      expect(mockReject).toHaveBeenCalledWith('reason');
      expect(mockReject.calls.all()[0].object).toBePromiseLike();
    });
  });
});
