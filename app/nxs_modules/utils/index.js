import * as color from './color';
import * as language from './language';

export const newUID = (function() {
  let counter = 1;
  return () => `uid-${counter++}`;
})();

export { color, language };
