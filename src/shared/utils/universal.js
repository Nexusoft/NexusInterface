export function debounced(fn, ms) {
  let timerId;
  return function() {
    const functionCall = () => fn.apply(this, arguments);
    clearTimeout(timerId);
    timerId = setTimeout(functionCall, ms);
    return timerId;
  };
}

export function throttled(fn, ms) {
  let lastTimerId;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      fn.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastTimerId);
      lastTimerId = setTimeout(function() {
        fn.apply(context, args);
        lastRan = Date.now();
      }, ms - (Date.now() - lastRan));
    }
    return lastTimerId;
  };
}
