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
    });

    afterEach(function() {
      Promise = RealPromise;
    });

    it('should call the resolver\'s resolve function with the correct value',
        function() {
          var deferred = new Deferred();
          deferred.resolve('value');
          expect(mockResolve).toHaveBeenCalledWith('value');
        });
  })

});
