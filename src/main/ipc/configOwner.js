'use strict';

function createConfigOwner(load) {
  let generation = 0;
  let cache;
  let current;
  let queue = Promise.resolve();

  function invalidate() {
    generation += 1;
    cache = undefined;
    current = undefined;
  }

  function get(settings) {
    if (cache) return Promise.resolve(cache);
    if (current) return current;
    const version = generation;
    const assertCurrent = () => {
      if (version !== generation) {
        const error = new Error('Core configuration changed while loading');
        error.code = 'CORE_CONFIG_INVALIDATED';
        throw error;
      }
    };
    const operation = queue.then(async () => {
      assertCurrent();
      const result = await load(settings, assertCurrent);
      assertCurrent();
      cache = result;
      return result;
    });
    queue = operation.then(() => undefined, () => undefined);
    current = operation;
    const clearCurrent = () => {
      if (current === operation) current = undefined;
    };
    operation.then(clearCurrent, clearCurrent);
    return operation;
  }
  return { get, invalidate };
}

module.exports = { createConfigOwner };
