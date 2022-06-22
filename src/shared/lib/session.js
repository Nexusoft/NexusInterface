import { tryParsingJson } from 'utils/json';

const localStorageKey = 'sessionCache';
const cacheStaleTime = 1000 * 60 * 60 * 24 * 7; // 7 days

export function loadSessionCache() {
  const cacheJson = localStorage.getItem(localStorageKey);
  const cache = tryParsingJson(cacheJson) || {};
  for (const sessionId in cache) {
    if (cache?.hasOwnProperty(sessionId)) {
      if (Date.now() - cacheStaleTime > cache[sessionId].time) {
        console.log('[Session cache] I found extreme stale key', sessionId);
        delete cache[sessionId];
      }
    }
  }
  return cache;
}

export function saveSessionCache(cache) {
  localStorage.setItem(localStorageKey, JSON.stringify(cache));
}

export function addSession({ sessionId, username }) {
  const cache = loadSessionCache();
  cache[sessionId] = { username, time: Date.now() };
  saveSessionCache(cache);
}
