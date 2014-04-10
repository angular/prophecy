export class PromiseMicroTask {
  constructor () {
  }

  flush() {
    if (!window.__asapFlush__) {
      throw new Error('Unable to flush MicroTask queue.');
    }
    window.__asapFlush__();
  }

  restoreNative() {
    window.Promise = window.__NonMonkeyPatchPromise__;
  }

  restoreTraceur() {
    window.Promise = window.__TraceurPromise__;
  }
}
