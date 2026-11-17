'use strict';

function createSharedQuerySubscription(start, stop) {
  let count = 0;
  let unsubscribe;
  return () => {
    if (count === 0) unsubscribe = start();
    count += 1;
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      count -= 1;
      if (count === 0) {
        unsubscribe();
        unsubscribe = undefined;
        stop();
      }
    };
  };
}

module.exports = { createSharedQuerySubscription };
