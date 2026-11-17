'use strict';

function createCoreLifecycleCoordinator() {
  let tail = Promise.resolve();
  let activeOperation = null;
  let shutdownRequested = false;

  const schedule = (label, operation) => {
    const scheduled = tail.then(async () => {
      activeOperation = label;
      try {
        return await operation();
      } finally {
        activeOperation = null;
      }
    });
    tail = scheduled.catch(() => undefined);
    return scheduled;
  };

  return Object.freeze({
    run(label, operation) {
      if (typeof label !== 'string' || !label || typeof operation !== 'function') {
        throw new TypeError('A labeled Core lifecycle operation is required');
      }
      if (shutdownRequested) {
        return Promise.reject(new Error('Core lifecycle is shutting down'));
      }
      return schedule(label, operation);
    },
    shutdown(operation) {
      if (typeof operation !== 'function') {
        throw new TypeError('A Core shutdown operation is required');
      }
      if (shutdownRequested) {
        return Promise.reject(
          new Error('Core lifecycle is already shutting down')
        );
      }
      shutdownRequested = true;
      return schedule('shutdown', operation).catch((error) => {
        shutdownRequested = false;
        throw error;
      });
    },
    cancelShutdown() {
      shutdownRequested = false;
    },
    getActiveOperation() {
      return activeOperation;
    },
  });
}

module.exports = {
  createCoreLifecycleCoordinator,
};
