/**
 * Redux middleware that helps automatically save a part of the redux state
 * into local storage whenever it's changed
 * @param string localStorageKey
 * @param array getStoredData
 */
export default function localStorageMiddleware(localStorageKey, getStoredData) {
  return (store) => (next) => (action) => {
    const oldData = getStoredData(store.getState());
    const result = next(action);
    const data = getStoredData(store.getState());
    if (data !== oldData) {
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    }
    return result;
  };
}
