/**
 * Miscellaneous utilities that can be used by both
 * renderer process and main process code
 */

export function debounced<Callback extends Function>(fn: Callback, ms: number) {
  let timerId: NodeJS.Timeout;
  const debouncedFunc = function (this: any) {
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

export function throttled<Callback extends Function>(fn: Callback, ms: number) {
  let lastTimerId: NodeJS.Timeout;
  let lastRan: number;
  return function (this: any) {
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
