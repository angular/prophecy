import {PromiseBackend} from '../src/PromiseBackend';
import {PromiseMock} from '../src/PromiseMock';

describe('PromiseBackend', function() {
  afterEach(function() {
    this.promiseBackend.restoreNative();
  });


  describe('constructor', function() {
    it('should create an empty queue', function() {
      this.promiseBackend = new PromiseBackend();
      expect(this.promiseBackend.queue.length).toBe(0);
    });


    it('should set a custom global object if provided', function() {
      var global = {};
      this.promiseBackend = new PromiseBackend(global);
      expect(this.promiseBackend.global).toBe(global);
    });


    it('should default to window as global if none provided', function() {
      this.promiseBackend = new PromiseBackend();
      expect(this.promiseBackend.global).toBe(window);
    });
  });


  describe('.flush()', function() {
    it('should execute all pending tasks', function() {
      var taskSpy = jasmine.createSpy();
      this.promiseBackend = new PromiseBackend();
      this.promiseBackend.queue.push(taskSpy);
      this.promiseBackend.queue.push(taskSpy);
      this.promiseBackend.flush();
      expect(taskSpy).toHaveBeenCalled();
      expect(taskSpy.calls.count()).toBe(2);
    });


    it('should empty the queue', function() {
      this.promiseBackend = new PromiseBackend();
      this.promiseBackend.queue.push(function(){});
      this.promiseBackend.flush();
      expect(this.promiseBackend.queue.length).toBe(0);
    });


    it('should complain if the queue is empty', function() {
      var self = this;
      this.promiseBackend = new PromiseBackend();
      expect(function() {
        this.promiseBackend.flush();
      }.bind(this)).toThrow(new Error('Nothing to flush!'));
    });


    it('should call each task with a null context', function() {
      var context, args;
      var task = function() {
        args = arguments;
        context = this;
      }
      this.promiseBackend = new PromiseBackend();
      this.promiseBackend.queue.push(task);
      this.promiseBackend.flush();
      expect(context).toBe(null);
      expect(Object.keys(args).length).toBe(0);
    });
  });


  describe('.restoreOriginal()', function() {
    it('should restore the original global Promise', function() {
      var global = {Promise: window.Promise};
      this.promiseBackend = new PromiseBackend(global);
      var OriginalPromise = Promise;

      expect(global.Promise).toBe(OriginalPromise);
      expect(typeof new OriginalPromise(function(){}).then).toBe('function');

      this.promiseBackend.patchWithMock();
      expect(global.Promise).not.toBe(OriginalPromise);

      this.promiseBackend.restoreNative();
      expect(global.Promise).toBe(OriginalPromise);
    });
  });


  describe('.executeAsap()', function() {
    it('should add a task at the end of the queue', function() {
      this.promiseBackend = new PromiseBackend();
      this.promiseBackend.queue.push(function(){});
      var callme = function(){};
      this.promiseBackend.executeAsap(callme);
      expect(this.promiseBackend.queue.length).toBe(2);
      expect(this.promiseBackend.queue[1]).toBe(callme);
    });
  });


  describe('.patchWithMock()', function() {
    it('should monkey-patch global Promise with mock', function() {
      var global = {Promise: window.Promise};
      this.promiseBackend = new PromiseBackend(global);
      var OriginalPromise = Promise;

      expect(global.Promise).toBe(OriginalPromise);
      expect(typeof new OriginalPromise(function(){}).then).toBe('function');

      this.promiseBackend.patchWithMock();
      expect(global.Promise).toBe(PromiseMock);
    });
  });


  describe('.verifyNoOutstandingTasks()', function() {
    it('should throw if the micro task queue has anything in it', function() {
      this.promiseBackend = new PromiseBackend();

      this.promiseBackend.queue.push(function(){});
      expect(function() {
        this.promiseBackend.verifyNoOutstandingTasks();
      }.bind(this)).toThrow(new Error('Pending tasks to be flushed'));
    });
  });
});
