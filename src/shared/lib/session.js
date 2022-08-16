import { tryParsingJson } from 'utils/json';

export const localStorageKey = 'sessionCache';
const cacheStaleTime = 1000 * 60 * 60 * 24 * 7; // 7 days

export function loadSessionCache() {
  const cacheJson = localStorage.getItem(localStorageKey);
  const cache = tryParsingJson(cacheJson) || {};
  for (const session in cache) {
    if (cache?.hasOwnProperty(session)) {
      if (Date.now() - cacheStaleTime > cache[session].time) {
        console.log('[Session cache] Found a stale key', session);
        delete cache[session];
      }
    }
  }
  return cache;
}
