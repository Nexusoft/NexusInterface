import axios from 'axios';
import semver from 'semver';

import { store } from 'lib/store';
import { showNotification } from 'lib/ui';
import { navigate } from 'lib/wallet';
import { tryParsingJson } from 'utils/json';
import { modulesAtom, modulesMapAtom } from './atoms';
import { Module, ProductionModule, isDevModule } from './module';
import { Repository } from './repo';

//If expanded consider moving to own file.
const localStorageKey = 'moduleUpdateCache';
const cacheStaleTime = 1000 * 60 * 60 * 24 * 7; // 7 days

function getRepoId(repo: Repository) {
  return `${repo.owner}/${repo.repo}`;
}

// Load cache and check cache for junk and remove
function loadCache() {
  const cacheJson = localStorage.getItem(localStorageKey);
  const cache = (cacheJson && tryParsingJson(cacheJson)) || {};
  for (const key in cache) {
    if (cache?.hasOwnProperty(key)) {
      if (Date.now() - cacheStaleTime * 4 > cache[key].time) {
        console.log('[Module update cache] I found extreme stale key', key);
        delete cache[key];
      }
    }
  }
  return cache;
}

function saveCache(cache: any) {
  localStorage.setItem(localStorageKey, JSON.stringify(cache));
}

export function removeUpdateCache(repo: Repository) {
  const repoId = getRepoId(repo);
  if (!repoId) return;
  const cache = loadCache();
  delete cache[repoId];
  saveCache(cache);
}

async function getLatestRelease(repo: Repository, { cache }: { cache: any }) {
  const repoId = getRepoId(repo);
  let repoCache = cache[repoId];
  if (repoCache && Date.now() - cacheStaleTime > repoCache.time) {
    delete cache[repoId];
    repoCache = null;
  }

  const url = `https://api.github.com/repos/${repoId}/releases/latest`;
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(repoCache?.etag && { 'If-None-Match': repoCache.etag }),
      },
    });
    const cacheObj = {
      id: response.data.id,
      tag_name: response.data.tag_name,
      assets: !!response.data.assets,
      etag: response.headers['etag'],
      time: Date.now(),
    };
    // cache.setItem(repoId, JSON.stringify(cacheObj));
    cache[repoId] = cacheObj;
    return response.data;
  } catch (err: any) {
    if (err?.response?.status === 304) {
      // 304 = Not modified
      return repoCache;
    }
    console.error(err);
    return null;
  }
}

async function checkForModuleUpdate(module: Module, { cache }: { cache: any }) {
  try {
    if (isDevModule(module) || !module.repository) return null;
    const release = await getLatestRelease(module.repository, { cache });
    if (!release || !release.tag_name || !release.assets) return null;

    const latestVersion = release.tag_name.startsWith('v')
      ? release.tag_name.substring(1)
      : release.tag_name;
    if (
      !semver.valid(latestVersion) ||
      !semver.valid(module.info.version) ||
      !semver.gt(latestVersion, module.info.version)
    ) {
      return null;
    }

    return { module, latestVersion, latestRelease: release };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function checkForModuleUpdates() {
  const modules = store.get(modulesAtom);
  const cache = loadCache();

  const prodModules = modules.filter(
    (m) => !isDevModule(m)
  ) as ProductionModule[];
  const updateableModules = prodModules
    .filter((module) => !!module.repository)
    .sort((a, b) =>
      a.hasNewVersion === b.hasNewVersion ? 1 : a.hasNewVersion ? 1 : -1
    );
  const results = await Promise.allSettled(
    updateableModules.map((m) => checkForModuleUpdate(m, { cache }))
  );
  const updates = results
    .filter(({ status, value }: any) => value && status === 'fulfilled')
    .map(({ value }: any) => value);
  saveCache(cache);

  if (updates.length > 0) {
    // let downloadedUpdates = [];
    // for (const update of updates) {
    //   try {
    //     const filePath = await downloadModuleUpdate(update.asset);
    //     downloadedUpdates.push({ ...update, filePath });
    //   } catch (err) {
    //     console.error(err);
    //   }
    // }

    showNotification(
      __(
        'Update available for %{smart_count} module |||| Updates available for %{smart_count} modules',
        updates.length
      ),
      {
        type: 'success',
        onClick: (closeNotif) => {
          navigate('/Settings/Modules');
          closeNotif();
        },
      }
    );
  }

  const modulesMap = { ...store.get(modulesMapAtom) };
  updates.forEach(({ module, latestVersion, latestRelease }) => {
    const currentModule = modulesMap[module.info.name];
    modulesMap[module.info.name] = {
      ...currentModule,
      hasNewVersion: true,
      latestVersion: latestVersion,
      latestRelease: latestRelease,
    } as ProductionModule;
  });
  store.set(modulesMapAtom, modulesMap);
}
