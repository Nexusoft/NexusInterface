import { ForwardedRef } from 'react';

// Also used by the module preload; keep this utility free of wallet dependencies.
export function passRef(el: any, ref: ForwardedRef<any>) {
  if (typeof ref === 'function') {
    ref(el);
  } else if (ref) {
    ref.current = el;
  }
}

export function refs(...list: Array<ForwardedRef<any> | undefined>) {
  return (el: any) => {
    list.forEach((ref) => {
      if (ref) {
        passRef(el, ref);
      }
    });
  };
}
