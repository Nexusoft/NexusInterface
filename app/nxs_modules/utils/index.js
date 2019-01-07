import * as color from './color';
import * as language from './language';

export const newUID = (function() {
  let counter = 1;
  return () => `uid-${counter++}`;
})();

export function normalizePath(path) {
  if (process.platform === 'win32') {
    return path.replace(/\\/g, '/');
  } else {
    return path;
  }
}

export { color, language };
