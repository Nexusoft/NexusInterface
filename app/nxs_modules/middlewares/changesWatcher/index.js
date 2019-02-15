import addressBook from './addressBook';

/**
 * Creates a middleware that watches the redux state changes and execute the corresponding side effects
 *
 * @export
 * @param {*} [watchers=[]]
 * @returns
 */
export function createChangesWatcher(watchers = []) {
  return store => next => action => {
    const state = store.getState();
    const result = next(action);
    const newState = store.getState();
    watchers.forEach(watcher => watcher(state, newState));
    return result;
  };
}

const watchers = [addressBook];

export default createChangesWatcher(watchers);
