import {Deferred} from '../src/ngDeferred';
import {MockPromise} from './MockPromise';

describe('Deferred', function() {
  var RealPromise = Promise;

  function mockGlobalPromise() {
    Promise = MockPromise
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
      var spy = spyOn(Promise.prototype, 'internalResolve_');
      var deferred = new Deferred();
      deferred.resolve('value');
      expect(spy).toHaveBeenCalledWith('value');
      expect(spy.calls.all()[0].object).toBePromiseLike();
    });
  });


  describe('.reject()', function() {
    beforeEach(mockGlobalPromise);
    afterEach(restoreGlobalPromise);

    it('should call the resolver\'s reject function with the correct value \
      and context', function() {
      var spy = spyOn(Promise.prototype, 'internalReject_');
      var deferred = new Deferred();

      deferred.reject('reason');
      expect(spy).toHaveBeenCalledWith('reason');
      expect(spy.calls.all()[0].object).toBePromiseLike();
    });
  });
});
