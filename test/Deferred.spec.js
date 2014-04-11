import {Deferred} from '../src/Deferred';
import {PromiseMock, PromiseBackend} from '../src/PromiseMock';

describe('Deferred', function() {
  var RealPromise = Promise;

  beforeEach(function() {
    PromiseBackend.patchWithMock();
  });

  afterEach(function() {
    PromiseBackend.restoreNativePromise();
    PromiseBackend.setGlobal(window);
    PromiseBackend.verifyNoOutstandingTasks();
    expect(Promise).not.toBe(PromiseMock);
  });

  describe('constructor', function() {
    it('should have a promise after constructing', function() {
      expect(new Deferred().promise).toBePromiseLike();
    });


    it('should be injectable via a convenience function', function() {
      expect(new Deferred().promise).toBePromiseLike();
    });
  });

  describe('.resolve()', function() {
    it('should call the resolver\'s resolve function with the correct value',
        function() {
          var resolveSpy = jasmine.createSpy();
          var deferred = new Deferred();
          deferred.promise.then(resolveSpy);

          deferred.resolve('value');
          PromiseBackend.flush();
          expect(resolveSpy).toHaveBeenCalledWith('value');
        });
  });


  describe('.reject()', function() {
    it('should call the resolver\'s reject function with the correct value',
        function() {
          var rejectSpy = jasmine.createSpy();
          var deferred = new Deferred();
          deferred.promise.then(null, rejectSpy);

          deferred.reject('reason');
          PromiseBackend.flush();
          expect(rejectSpy).toHaveBeenCalledWith('reason');
        });
  });
});
