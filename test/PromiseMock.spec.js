import {PromiseMock, PromiseBackend} from '../src/PromiseMock';

describe('PromiseBackend', function() {
  afterEach(function() {
    PromiseBackend.restoreNativePromise();
    PromiseBackend.setGlobal(window);
    PromiseBackend.verifyNoOutstandingTasks();
    expect(Promise).not.toBe(PromiseMock);
  });


  it('should start with an empty queue', function() {
    expect(PromiseBackend.queue.length).toBe(0);
  });


  it('should set a custom global object if provided', function() {
    var global = {};
    PromiseBackend.setGlobal(global);
    expect(PromiseBackend.global).toBe(global);
  });


  it('should default to window as global if none provided', function() {
    expect(PromiseBackend.global).toBe(window);
  });


  describe('.flush()', function() {
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
  });


  describe('.restoreOriginal()', function() {
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
    it('should add a task at the end of the queue', function() {
      PromiseBackend.queue.push(function(){});
      var callme = function(){};
      PromiseBackend.executeAsap(callme);
      expect(PromiseBackend.queue.length).toBe(2);
      expect(PromiseBackend.queue[1]).toBe(callme);
    });
  });


  describe('.patchWithMock()', function() {
    it('should monkey-patch global Promise with mock', function() {
      var global = {Promise: window.Promise};
      var OriginalPromise = Promise;

      PromiseBackend.setGlobal(global);
      expect(global.Promise).toBe(OriginalPromise);
      expect(typeof new OriginalPromise(function(){}).then).toBe('function');

      PromiseBackend.patchWithMock();
      expect(global.Promise).toBe(PromiseMock);
    });
  });


  describe('.verifyNoOutstandingTasks()', function() {
    it('should throw if the micro task queue has anything in it', function() {
      PromiseBackend.queue.push(function(){});
      expect(function() {
        PromiseBackend.verifyNoOutstandingTasks();
      }).toThrow(new Error('Pending tasks to be flushed'));
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

