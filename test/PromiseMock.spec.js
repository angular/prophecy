import {PromiseMock, PromiseBackend} from '../src/PromiseMock';

describe('PromiseBackend', function() {
  afterEach(function() {
    delete PromiseBackend.queue;
  });


  describe('constructor', function() {
    afterEach(function() {
      PromiseBackend.instance = undefined;
    });


    it('should create an empty queue on class', function() {
      var backend = new PromiseBackend();
      expect(PromiseBackend.queue.length).toBe(0);
    });


    it('should return a new instance each time', function() {
      expect(PromiseBackend.instance).toBeUndefined();
      var backend = new PromiseBackend();
      var backend2 = new PromiseBackend();
      expect(backend).not.toBe(backend2);
    });


    it('should not interfere with an existing shared queue', function() {
      new PromiseBackend();
      expect(PromiseBackend.queue.length).toBe(0);
      PromiseBackend.queue.push('foo');
      new PromiseBackend();
      expect(PromiseBackend.queue).toEqual(['foo']);
    });


    it('should start with the native Promise registered ', function() {
      var backend = new PromiseBackend();
      expect(backend.__OriginalPromise__).toBe(window.Promise);
    });


    it('should set a custom global object if provided', function() {
      var global = {};
      var backend = new PromiseBackend();
      backend.setGlobal(global);
      expect(backend.global).toBe(global);
    });
  });


  it('should default to window as global if none provided', function() {
    var backend = new PromiseBackend();
    expect(backend.global).toBe(window);
  });


  it('should default to "global" object if window is undefined', function() {
    var global = {};
    var backend = new PromiseBackend(global);
    expect(backend.global).toBe(global);
  });


  describe('.flush()', function() {
    it('should execute all pending tasks', function() {
      var taskSpy = jasmine.createSpy();
      var backend = new PromiseBackend();
      PromiseBackend.queue.push(taskSpy);
      PromiseBackend.queue.push(taskSpy);
      backend.flush();
      expect(taskSpy).toHaveBeenCalled();
      expect(taskSpy.calls.count()).toBe(2);
    });


    it('should empty the queue', function() {
      var backend = new PromiseBackend();
      PromiseBackend.queue.push(function(){});
      expect(PromiseBackend.queue.length).toBe(1);
      backend.flush();
      expect(PromiseBackend.queue.length).toBe(0);
    });


    it('should complain if the queue is empty', function() {
      expect(function() {
        var backend = new PromiseBackend();
        backend.flush();
      }).toThrow(new Error('Nothing to flush!'));
    });


    it('should call each task with a null context', function() {
      var context, args;
      var backend = new PromiseBackend();
      var task = function() {
        args = arguments;
        context = this;
      }
      PromiseBackend.queue.push(task);
      backend.flush();
      expect(context).toBe(null);
      expect(Object.keys(args).length).toBe(0);
    });


    it('should not flush tasks that were added to the queue by other tasks',
        function() {
          var backend = new PromiseBackend();
          var tardySpy = jasmine.createSpy('tardy');
          PromiseBackend.queue.push(function() {
            PromiseBackend.queue.push(tardySpy);
          });
          backend.flush();
          expect(PromiseBackend.queue.length).toBe(1);
          backend.flush();
        });


    it('should flush tasks that were added to the queue by other tasks if passed "true"',
        function() {
          var backend = new PromiseBackend();
          var tardySpy = jasmine.createSpy('tardy');
          PromiseBackend.queue.push(function() {
            PromiseBackend.queue.push(tardySpy);
          });
          backend.flush(true);
          expect(PromiseBackend.queue.length).toBe(0);
        });
  });


  describe('.restoreOriginal()', function() {
    it('should restore the original global Promise', function() {
      var global = {Promise: window.Promise};
      var OriginalPromise = Promise;
      var backend = new PromiseBackend();
      backend.setGlobal(global);
      expect(global.Promise).toBe(OriginalPromise);
      expect(typeof new OriginalPromise(function(){}).then).toBe('function');

      backend.patchWithMock();
      expect(global.Promise).not.toBe(OriginalPromise);

      backend.restoreNativePromise();
      expect(global.Promise).toBe(OriginalPromise);
    });
  });


  describe('.executeAsap()', function() {
    it('should add a task at the end of the queue', function() {
      var backend = new PromiseBackend();
      PromiseBackend.queue.push(function(){});
      var callme = function(){};
      PromiseBackend.executeAsap(callme);
      expect(PromiseBackend.queue.length).toBe(2);
      expect(PromiseBackend.queue[1]).toBe(callme);
      backend.flush();
    });
  });


  describe('.patchWithMock()', function() {
    it('should monkey-patch global Promise with mock', function() {
      var global = {Promise: window.Promise};
      var OriginalPromise = Promise;
      var backend = new PromiseBackend(global);

      expect(global.Promise).toBe(OriginalPromise);
      expect(typeof new OriginalPromise(function(){}).then).toBe('function');

      backend.patchWithMock();
      expect(global.Promise).toBe(PromiseMock);
    });
  });


  describe('.verifyNoOutstandingTasks()', function() {
    it('should throw if the micro task queue has anything in it', function() {
      var backend = new PromiseBackend();
      PromiseBackend.queue.push(function(){});
      expect(function() {
        backend.verifyNoOutstandingTasks();
      }).toThrow(new Error('Pending tasks to be flushed'));
      backend.flush();
    });
  });


  describe('.forkZone', function() {
    it('should return a new zone', function() {
      var backend = new PromiseBackend();
      var zone1 = backend.forkZone();
      var zone2 = backend.forkZone();
      expect(zone1).not.toBe(zone2);
    });


    it('should automatically patch and unpatch window.Promise', function() {
      var winPromise = window.Promise;
      var backend = new PromiseBackend();
      backend.forkZone()
        .run(function() {
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
    var backend = new PromiseBackend();
    new PromiseMock(function(res, rej) {
      res('success!');
    }).then(goodSpy);
    backend.flush();
    expect(goodSpy).toHaveBeenCalledWith('success!');
  });
});

