import { tryParsingJson } from 'utils/json';

const localStorageKey = 'sessionCache';
const cacheStaleTime = 1000 * 60 * 60 * 24 * 7; // 7 days

export function loadSessionCache() {
  const cacheJson = localStorage.getItem(localStorageKey);
  const cache = tryParsingJson(cacheJson) || {};
  for (const session in cache) {
    if (cache?.hasOwnProperty(session)) {
      if (Date.now() - cacheStaleTime > cache[session].time) {
        console.log('[Session cache] I found extreme stale key', session);
        delete cache[session];
      }
    }
  }
  return cache;
}

export function saveSessionCache(cache) {
  localStorage.setItem(localStorageKey, JSON.stringify(cache));
}

/**
 * Save session information including username into localStorage
 */
export function saveSessionUsername({ session, username }) {
  const cache = loadSessionCache();
  cache[session] = { username, time: Date.now() };
  saveSessionCache(cache);
}

export function getCachedUsername(session) {
  const cache = loadSessionCache();
  return cache[session]?.username || null;
}
