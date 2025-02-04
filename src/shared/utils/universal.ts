/**
 * Miscellaneous utilities that can be used by both
 * renderer process and main process code
 */

export function debounced<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): {
  (...args: Parameters<T>): NodeJS.Timeout;
  cancel: () => void;
} {
  let timerId: NodeJS.Timeout;
  const debouncedFunc = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    const functionCall = () => fn.apply(this, args);
    clearTimeout(timerId);
    timerId = setTimeout(functionCall, ms);
    return timerId;
  };
  debouncedFunc.cancel = () => {
    clearTimeout(timerId);
  };
  return debouncedFunc;
}

export function throttled<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => NodeJS.Timeout {
  let lastTimerId: NodeJS.Timeout;
  let lastRan: number;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
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

// Helper type to get properties with same type from two objects
type PropertiesWithSameType<T, U> = {
  [K in keyof T & keyof U]: T[K] extends U[K]
    ? U[K] extends T[K]
      ? K
      : never
    : never;
}[keyof T & keyof U];
// Get common properties with same types
export type CommonProperties<T, U> = Pick<T, PropertiesWithSameType<T, U>>;
