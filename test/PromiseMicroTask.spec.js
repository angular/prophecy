import {PromiseMicroTask} from '../src/PromiseMicroTask';
import {use, inject} from 'di/testing';

describe('PromiseMicroTask', function() {
  it('should have monkey-patched Promise', inject(
      PromiseMicroTask,
      function(promiseMicroTask) {
        var goodSpy = jasmine.createSpy('goodSpy');
        var badSpy = jasmine.createSpy('badSpy');

        var p = new Promise(function(res, rej) {
          res('resolved');
        }).then(goodSpy);

        promiseMicroTask.flush();
        expect(goodSpy).toHaveBeenCalledWith('resolved');
        expect(badSpy).not.toHaveBeenCalled();
      }));

  describe('.flush()', function() {
    it('should complain if window.__asapFlush__ is undefined', inject(
        PromiseMicroTask,
        function(promiseMicroTask) {
          var asapFlush = window.__asapFlush__;
          window.__asapFlush__ = null;
          expect(function() {
            promiseMicroTask.flush();
          }).toThrow(new Error('Unable to flush MicroTask queue.'));
          window.__asapFlush__ = asapFlush;
          promiseMicroTask.flush();
        }));
  });

  describe('.restoreNative()', function() {
    //TODO: Should keep Traceur Promise if browser doesn't provide Promise
    it('should restore the original window.Promise', inject(
        PromiseMicroTask,
        function(promiseMicroTask) {
          var traceurPromise = window.Promise;
          promiseMicroTask.restoreNative();
          expect(window.Promise).not.toBe(traceurPromise);
          expect(window.Promise.toString()).toContain('[native code]');
        }));
  });


  describe('.restoreTraceur()', function() {
    it('should re-instate Traceur promise', inject(
        PromiseMicroTask,
        function(promiseMicroTask) {
          promiseMicroTask.restoreNative();
          var nativePromise = window.Promise;
          expect(nativePromise.toString()).toContain('[native code]');
          promiseMicroTask.restoreTraceur();
          expect(window.Promise).not.toBe(nativePromise);
          expect(window.Promise.toString()).not.toContain('[native code]');
        }));
  });

});
