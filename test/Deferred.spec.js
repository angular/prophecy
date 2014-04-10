import {Deferred} from '../src/Deferred';
import {PromiseMock, PromiseMockInjectable, PromiseBackend} from '../src/PromiseMock';
import {use, inject} from 'di/testing';

describe('Deferred', function() {
  var RealPromise = Promise;

  describe('constructor', function() {
    it('should have a promise after constructing', inject(Deferred,
        function(Deferred) {
          expect(new Deferred().promise).toBePromiseLike();
        }));


    it('should be injectable via a convenience function', inject(
        Deferred,
        function(Deferred) {
          expect(new Deferred().promise).toBePromiseLike();
        }));
  });

  describe('.resolve()', function() {
    beforeEach(function() {
      use(PromiseMockInjectable);
    });

    afterEach(function() {
      PromiseBackend.restoreNativePromise();
      PromiseBackend.setGlobal(window);
      PromiseBackend.verifyNoOutstandingTasks();
      expect(Promise).not.toBe(PromiseMock);
    });

    it('should call the resolver\'s resolve function with the correct value',
        inject(Deferred, function(Deferred) {
          var resolveSpy = jasmine.createSpy();
          var deferred = new Deferred(PromiseMock);
          deferred.promise.then(null, resolveSpy);

          deferred.reject('value');
          PromiseBackend.flush();
          expect(resolveSpy).toHaveBeenCalledWith('value');
        }));
  });


  describe('.reject()', function() {
    beforeEach(function(){
      use(PromiseMockInjectable);
    });

    afterEach(function() {
      PromiseBackend.restoreNativePromise();
      PromiseBackend.setGlobal(window);
      PromiseBackend.verifyNoOutstandingTasks();
      expect(Promise).not.toBe(PromiseMock);
    });

    it('should call the resolver\'s reject function with the correct value',
        inject(Deferred, function(Deferred) {
          var rejectSpy = jasmine.createSpy();
          var deferred = new Deferred();
          deferred.promise.then(null, rejectSpy);

          deferred.reject('reason');
          PromiseBackend.flush();
          expect(rejectSpy).toHaveBeenCalledWith('reason');
        }));
  });
});
