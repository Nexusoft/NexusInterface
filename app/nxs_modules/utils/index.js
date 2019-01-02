export const newUID = (function() {
  let counter = 1;
  return () => `uid-${counter++}`;
})();

export * as color from './color';

export * as language from './language';
