/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

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
  } else if (ref) {
    ref.current = el;
  }
}

export async function showDesktopNotif(title, message) {
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    new Notification(title, { body: message });
  }
}

export function getAssetData(asset) {
  if (!asset) return asset;
  const { name, created, modified, address, owner, ownership, ...data } = asset;
  return data;
}

/**
 * Retrieve value deep inside an object by a path.
 * Useful for redux-form's Fields component
 *
 * @export
 * @param {object} object the containing object
 * @param {string} path example: foo.bar[0].abc.x
 */
export function getDeep(object, path) {
  let result = object;
  let cursor = 0;
  for (let i = 0; i <= path.length; ++i) {
    const char = path[i];

    if (char === '.' || char === '[' || i === path.length) {
      if (path[cursor] === '[') {
        // array notation [index] => remove the starting [ and
        // the ending ] characters to get the index
        const index = parseInt(path.slice(cursor + 1, i - 1));
        result = result[index];
      } else {
        // property notation .key => remove the starting . character
        // (if any) to get the property key
        const key =
          path[cursor] === '.'
            ? path.slice(cursor + 1, i)
            : path.slice(cursor, i);
        result = result[key];
      }
      cursor = i;

      if (result === undefined || result === null) {
        break;
      }
    }
  }
  return result;
}
