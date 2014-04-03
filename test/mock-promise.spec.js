import {MockPromise} from './MockPromise';

describe('MockPromise', function() {
  var noop = function () {};
  describe('constructor', function() {
    beforeEach(function() {
      delete MockPromise.queue;
    });

    it('should create a queue on the constructor', function() {
      expect(MockPromise.queue).toBeUndefined();
      new MockPromise(noop);
      expect(MockPromise.queue).toEqual([]);
    });


    it('should not create a queue if one already exists', function() {
      var firstQueue;
      new MockPromise(noop);
      firstQueue = MockPromise.queue;
      new MockPromise(noop);
      expect(MockPromise.queue).toBe(firstQueue);
    });


    it('should call the resolver function with resolve and reject functions',
        function() {
          var spy = jasmine.createSpy();
          new MockPromise(spy);
          var args = spy.calls.argsFor(0);
          expect(spy).toHaveBeenCalled();
          expect(typeof args[0]).toBe('function');
          expect(args[0].toString()).toContain('(value)');
          expect(typeof args[1]).toBe('function');
          expect(args[1].toString()).toContain('(reason)');
        });
  });
});
