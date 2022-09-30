import { tryParsingJson } from 'utils/json';

export const localStorageKey = 'usernameByGenesis';

export function loadUsernameByGenesis() {
  const cacheJson = localStorage.getItem(localStorageKey);
  const cache = tryParsingJson(cacheJson) || {};
  return cache;
}
