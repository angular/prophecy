import {Deferred} from '../src/Deferred';
import {PromiseMock, PromiseBackend} from '../src/PromiseMock';

describe('Deferred', function() {
  var RealPromise = Promise;

  beforeEach(function() {
    this.backend = new PromiseBackend();
    this.zone = this.backend.forkZone();
  });

  afterEach(function() {
    expect(Promise).not.toBe(PromiseMock);
  });

  describe('constructor', function() {
    it('should have a promise after constructing', function() {
      this.zone.run(function() {
        expect(new Deferred().promise).toBePromiseLike();
      });
    });


    it('should be injectable via a convenience function', function() {
      zone.run(function() {
        expect(new Deferred().promise).toBePromiseLike();
      });
    });
  });

  describe('.resolve()', function() {
    it('should call the resolver\'s resolve function with the correct value',
        function() {
          var backend = this.backend;
          var resolveSpy = jasmine.createSpy();
          this.zone.run(function() {
            var deferred = new Deferred();
            deferred.promise.then(resolveSpy);
            deferred.resolve('value');

            //Flush once for the resolve, then once for each item in the chain
            backend.flush(true);
            expect(resolveSpy).toHaveBeenCalledWith('value');
          });
        });
  });


  describe('.reject()', function() {
    it('should call the resolver\'s reject function with the correct value',
        function() {
          var rejectSpy = jasmine.createSpy();
          var backend = this.backend;
          this.zone.run(function() {
            var deferred = new Deferred();
            deferred.promise.then(null, rejectSpy);

            deferred.reject('reason');
            backend.flush(true);
          });
          expect(rejectSpy).toHaveBeenCalledWith('reason');
        });
  });
});
