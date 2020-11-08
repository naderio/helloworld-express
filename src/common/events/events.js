import { EventEmitter as NativeEventEmitter } from 'events';

export class EventEmitter extends NativeEventEmitter {
  emitAsync(event, ...args) {
    return this.listeners(event)
      .reduce((promise, listener) => promise.then(() => Promise.resolve(listener(...args))), Promise.resolve(null))
      .catch((error) => {
        throw error;
      });
  }

  onceAsync(event) {
    return new Promise((resolve) => this.once(event, resolve));
  }
}
