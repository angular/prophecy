import {PromiseMock, PromiseBackend} from '../src/PromiseMock';

describe('PromiseBackend', function() {
  afterEach(function() {
    delete PromiseBackend.queue;
    PromiseBackend.setGlobal(window);
    expect(Promise).not.toBe(PromiseMock);
  });

  describe('.flush()', function() {
    beforeEach(function() {
      PromiseBackend.queue = [];
    });


    it('should execute all pending tasks', function() {
      var taskSpy = jasmine.createSpy();
      PromiseBackend.queue.push(taskSpy);
      PromiseBackend.queue.push(taskSpy);
      PromiseBackend.flush();
      expect(taskSpy).toHaveBeenCalled();
      expect(taskSpy.calls.count()).toBe(2);
    });


    it('should empty the queue', function() {
      PromiseBackend.queue.push(function(){});
      expect(PromiseBackend.queue.length).toBe(1);
      PromiseBackend.flush();
      expect(PromiseBackend.queue.length).toBe(0);
    });


    it('should complain if the queue is empty', function() {
      expect(function() {
        PromiseBackend.flush();
      }).toThrow(new Error('Nothing to flush!'));
    });


    it('should call each task with a null context', function() {
      var context, args;
      var task = function() {
        args = arguments;
        context = this;
      }
      PromiseBackend.queue.push(task);
      PromiseBackend.flush();
      expect(context).toBe(null);
      expect(Object.keys(args).length).toBe(0);
    });


    it('should not flush tasks that were added to the queue by other tasks',
        function() {
          var tardySpy = jasmine.createSpy('tardy');
          PromiseBackend.queue.push(function() {
            PromiseBackend.queue.push(tardySpy);
          });
          PromiseBackend.flush();
          expect(PromiseBackend.queue.length).toBe(1);
          PromiseBackend.flush();
        });


    it('should flush tasks that were added to the queue by other tasks if passed "true"',
        function() {
          var tardySpy = jasmine.createSpy('tardy');
          PromiseBackend.queue.push(function() {
            PromiseBackend.queue.push(tardySpy);
          });
          PromiseBackend.flush(true);
          expect(PromiseBackend.queue.length).toBe(0);
        });


    it('should return the PromiseBackend instance for chaining', function() {
      PromiseBackend.executeAsap(function() {});
      expect(PromiseBackend.flush()).toBe(PromiseBackend);
    });
  });


  describe('.setGlobal()', () => {
    it('should set a custom global object if provided', function() {
      var global = {};
      PromiseBackend.setGlobal(global);
      expect(PromiseBackend.global).toBe(global);
    });


    it('should default to window as global if none provided', function() {
      delete PromiseBackend.global;
      PromiseBackend.setGlobal();
      expect(PromiseBackend.global).toBe(window);
    });


    it('should default to "global" object if window is undefined', function() {
      var global = {};
      PromiseBackend.setGlobal(global);
      expect(PromiseBackend.global).toBe(global);
    });
  });


  describe('.restoreNativePromise()', function() {
    it('should use the Promise of whatever global is set', function() {
      delete PromiseBackend.global;
      PromiseBackend.__OriginalPromise__ = window.Promise;
      var fakePromise = function() {};
      var fakeGlobal = {Promise: fakePromise};
      PromiseBackend.setGlobal(fakeGlobal);
      expect(fakeGlobal.Promise).toBe(fakePromise);
      PromiseBackend.restoreNativePromise();
      expect(fakeGlobal.Promise).not.toBe(fakePromise);
    });


    it('should complain if __OriginalPromise__ is not set', function() {
      delete PromiseBackend.__OriginalPromise__;
      expect(PromiseBackend.restoreNativePromise).
          toThrow(new ReferenceError('__OriginalPromise__ is not set. restoreNativePromise should only be called after calling "patchWithMock()"'))
    });


    it('should restore the original global Promise', function() {
      var global = {Promise: window.Promise};
      var OriginalPromise = Promise;
      PromiseBackend.setGlobal(global);
      expect(global.Promise).toBe(OriginalPromise);
      expect(typeof new OriginalPromise(function(){}).then).toBe('function');

      PromiseBackend.patchWithMock();
      expect(global.Promise).not.toBe(OriginalPromise);

      PromiseBackend.restoreNativePromise();
      expect(global.Promise).toBe(OriginalPromise);
    });
  });


  describe('.executeAsap()', function() {
    it('should create a queue if one does not yet exist', function() {
      delete PromiseBackend.queue;
      expect(PromiseBackend.queue).toBeUndefined();
      PromiseBackend.executeAsap(function() {});
      expect(PromiseBackend.queue).toBeDefined()
      expect(PromiseBackend.queue.length).toBe(1);
      PromiseBackend.flush();
    });


    it('should add a task at the end of the queue', function() {
      var spy1 = jasmine.createSpy();
      var spy2 = jasmine.createSpy();
      PromiseBackend.executeAsap(spy1);
      PromiseBackend.executeAsap(spy2);
      expect(PromiseBackend.queue.length).toBe(2);
      expect(PromiseBackend.queue[1]).toBe(spy2);
      PromiseBackend.flush().verifyNoOutstandingTasks();
    });
  });


  describe('.patchWithMock()', function() {
    it('should monkey-patch global Promise with mock', function() {
      var global = {Promise: window.Promise};
      var OriginalPromise = window.Promise;

      PromiseBackend.setGlobal(global);
      expect(global.Promise).toBe(OriginalPromise);
      expect(typeof new OriginalPromise(function(){}).then).toBe('function');

      PromiseBackend.patchWithMock();
      expect(global.Promise).toBe(PromiseMock);
      PromiseBackend.restoreNativePromise();
    });


    it('should start with the native Promise registered ', function() {
      var winPromise = window.Promise;
      PromiseBackend.patchWithMock();
      expect(PromiseBackend.__OriginalPromise__).toBe(winPromise);
      PromiseBackend.restoreNativePromise();
    });
  });


  describe('.verifyNoOutstandingTasks()', function() {
    it('should throw if the micro task queue has anything in it', function() {
      PromiseBackend.queue = [];
      PromiseBackend.queue.push(function(){});
      expect(function() {
        PromiseBackend.verifyNoOutstandingTasks();
      }).toThrow(new Error('Pending tasks to be flushed'));
      PromiseBackend.flush();
    });
  });


  describe('.forkZone', function() {
    it('should return a new zone', function() {
      var zone1 = PromiseBackend.forkZone();
      var zone2 = PromiseBackend.forkZone();
      expect(zone1).not.toBe(zone2);
    });


    it('should automatically patch and unpatch window.Promise', function() {
      var winPromise = window.Promise;
      PromiseBackend.forkZone()
        .run(function() {
          expect(Promise).toBe(PromiseMock);
          expect(Promise).not.toBe(winPromise);
        });
      expect(Promise).toBe(winPromise);
    });
  });
});

describe('PromiseMock', function() {
  it('should construct', function() {
    new PromiseMock(function(){});
  });


  it('should throw if no resolver is given', function() {
    expect(function() {
      new PromiseMock();
    }).toThrow(new TypeError);
  })

  it('should allow synchronous flushing', function() {
    var goodSpy = jasmine.createSpy();
    new PromiseMock(function(res, rej) {
      res('success!');
    }).then(goodSpy);
    PromiseBackend.flush();
    expect(goodSpy).toHaveBeenCalledWith('success!');
  });
});

