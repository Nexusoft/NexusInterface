export default function memoize<TCallback extends (...args: any[] | []) => any>(
  callback: (...args: Parameters<TCallback>) => ReturnType<TCallback>,
  isEqual: (
    args: Parameters<TCallback>,
    lastArgs: Parameters<TCallback>
  ) => boolean = areInputsEqual
) {
  let lastThis: any;
  let lastArgs: Parameters<TCallback> = [] as Parameters<TCallback>;
  let lastResult: ReturnType<TCallback>;
  let calledOnce = false;

  // breaking cache when context (this) or arguments change
  function memoized(this: any, ...newArgs: Parameters<TCallback>) {
    if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
      return lastResult;
    }

    // Throwing during an assignment aborts the assignment: https://codepen.io/alexreardon/pen/RYKoaz
    // Doing the lastResult assignment first so that if it throws
    // nothing will be overwritten
    lastResult = callback.apply(this, newArgs);
    calledOnce = true;
    lastThis = this;
    lastArgs = newArgs;
    return lastResult;
  }

  return memoized;
}

function areInputsEqual<TParams extends any[]>(
  newInputs: TParams,
  lastInputs: TParams
) {
  // no checks needed if the inputs length has changed
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  // Using for loop for speed. It generally performs better than array.every
  // https://github.com/alexreardon/memoize-one/pull/59
  for (let i = 0; i < newInputs.length; i++) {
    // using shallow equality check
    if (newInputs[i] !== lastInputs[i]) {
      return false;
    }
  }
  return true;
}
