export const newUID = (function() {
  let counter = 1;
  return () => `uid-${counter++}`;
})();

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711
export function escapeRegExp(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function passRef(el, ref) {
  if (typeof ref === 'function') {
    ref(el);
  } else {
    ref.current = el;
  }
}
