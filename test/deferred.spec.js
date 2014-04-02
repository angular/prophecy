import {Deferred} from '../src/ngDeferred';

describe('Deferred', function() {
  describe('constructor', function() {
    it('should have a promise after constructing', function() {
      expect(new Deferred().promise).toBePromiseLike();
    });
  });

  describe('.resolve()', function() {
    var RealPromise = Promise,
        mockResolve,
        mockReject;

    beforeEach(function () {
      mockResolve = jasmine.createSpy();
      mockReject = jasmine.createSpy();
      Promise = function (resolver) {
        resolver.call(this, mockResolve, mockReject);
      };
      Promise.prototype.then = jasmine.createSpy();
    });

    afterEach(function() {
      Promise = RealPromise;
    });

    it('should call the resolver\'s resolve function with the correct value \
      and context', function() {
      var deferred = new Deferred();
      deferred.resolve('value');
      expect(mockResolve).toHaveBeenCalledWith('value');
      expect(mockResolve.calls.all()[0].object).toBePromiseLike();
    });
  });

});
