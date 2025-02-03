export default function memoize<TCallback extends (...args: any[]) => any>(
  callback: TCallback,
  isEqual: (
    args: Parameters<TCallback>,
    lastArgs?: Parameters<TCallback>
  ) => boolean = areInputsEqual
): TCallback {
  let lastThis: any;
  let lastArgs: Parameters<TCallback> | undefined = undefined;
  let lastResult: ReturnType<TCallback>;

  // breaking cache when context (this) or arguments change
  function memoized(
    this: any,
    ...newArgs: Parameters<TCallback>
  ): ReturnType<TCallback> {
    if (lastThis === this && isEqual(newArgs, lastArgs)) {
      return lastResult;
    }

    // Throwing during an assignment aborts the assignment: https://codepen.io/alexreardon/pen/RYKoaz
    // Doing the lastResult assignment first so that if it throws
    // nothing will be overwritten
    lastResult = callback.apply(this, newArgs);
    lastThis = this;
    lastArgs = newArgs;
    return lastResult;
  }

  return memoized as TCallback;
}

function areInputsEqual<TParams extends any[]>(
  newInputs: TParams,
  lastInputs?: TParams
): boolean {
  // no checks needed if the inputs length has changed or if there were no previous inputs
  if (!lastInputs || newInputs.length !== lastInputs.length) {
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
