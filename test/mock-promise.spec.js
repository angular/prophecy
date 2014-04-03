import {MockPromise, MockFulfillment} from './MockPromise';

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


  describe('.internalResolve_()', function() {
    var promise;
    beforeEach(function() {
      promise = new MockPromise(noop);
    });

    afterEach(function () {
      delete MockPromise.queue;
    });

    it('should add an item to the queue when resolving', function() {
      promise.internalResolve_('success');
      expect(MockPromise.queue.length).toBe(1);
      expect(MockPromise.queue[0]).toEqual(
          new MockFulfillment('resolve', 'success', promise));
    });
  });


  describe('.internalReject_()', function() {
    var promise;
    beforeEach(function() {
      promise = new MockPromise(noop);
    });

    afterEach(function () {
      delete MockPromise.queue;
    });

    it('should add an item to the queue when resolving', function() {
      promise.internalReject_('failure');
      expect(MockPromise.queue.length).toBe(1);
      expect(MockPromise.queue[0]).toEqual(
          new MockFulfillment('reject', 'failure', promise));
    });
  });


  describe('.flush()', function() {
    it('should execute every item in the queue in order', function() {
      var executionOrder = [];
      MockPromise.verifyNothingToFlush();
      var promise1 = new MockPromise(noop).then(function(value) {
        executionOrder.push(value);
      });
      var promise2 = new MockPromise(noop).then(null, function(reason) {
        executionOrder.push(reason);
      });
      promise1.internalResolve_('success!');
      promise2.internalReject_('failure!');

      MockPromise.flush();
      expect(executionOrder).toEqual(['success!', 'failure!']);
    });
  });
});
