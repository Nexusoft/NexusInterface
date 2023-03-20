/**
 * Miscellaneous utilities that can be used by both
 * renderer process and main process code
 */

export function debounced(fn, ms) {
  let timerId;
  const debouncedFunc = function () {
    const functionCall = () => fn.apply(this, arguments);
    clearTimeout(timerId);
    timerId = setTimeout(functionCall, ms);
    return timerId;
  };
  debouncedFunc.cancel = () => {
    clearTimeout(timerId);
  };
  return debouncedFunc;
}

export function throttled(fn, ms) {
  let lastTimerId;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      fn.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastTimerId);
      lastTimerId = setTimeout(function () {
        fn.apply(context, args);
        lastRan = Date.now();
      }, ms - (Date.now() - lastRan));
    }
    return lastTimerId;
  };
}
