// import fs from 'fs';
// import { join } from 'path';
import axios from 'axios';
import semver from 'semver';

import store from 'store';
import * as TYPE from 'consts/actionTypes';
import { showNotification } from 'lib/ui';
import { navigate } from 'lib/wallet';
import { tryParsingJson } from 'utils/json';
// import { walletDataDir } from 'consts/paths';
// import ensureDirExists from 'utils/ensureDirExists';
// import downloadFile from 'utils/downloadFile';

// const pendingDir = join(walletDataDir, 'module_updates', 'pending');
// const completeDir = join(walletDataDir, 'module_updates', 'complete');

//If expanded consider moving to own file.
const localStorageKey = 'moduleUpdateCache';
const cacheStaleTime = 1000 * 60 * 60 * 24 * 7; // 7 days

// const getAssetName = (name, version) => `${name}_v${version}.zip`;

function getRepoId(repo) {
  if (!repo?.owner || !repo?.repo) return null;
  return `${repo.owner}/${repo.repo}`;
}

// Load cache and check cache for junk and remove
function loadCache() {
  const cacheJson = localStorage.getItem(localStorageKey);
  const cache = tryParsingJson(cacheJson) || {};
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

function saveCache(cache) {
  localStorage.setItem(localStorageKey, JSON.stringify(cache));
}

export function removeUpdateCache(repo) {
  const repoId = getRepoId(repo);
  if (!repoId) return;
  const cache = loadCache();
  delete cache[repoId];
  saveCache(cache);
}

async function getLatestRelease(repo, { cache }) {
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
      etag: response.headers.etag,
      time: Date.now(),
    };
    // cache.setItem(repoId, JSON.stringify(cacheObj));
    cache[repoId] = cacheObj;
    return response.data;
  } catch (err) {
    if (err?.response?.status === 304) {
      // 304 = Not modified
      return repoCache;
    }
    console.error(err);
    return null;
  }
}

async function checkForModuleUpdate(module, { cache }) {
  try {
    if (!module.repository) return null;
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

    // const assetName = getAssetName(module.info.name, latestVer);
    // const asset = latest.assets.find(a => a.name === assetName);
    // if (!asset) return null;

    // return { module, asset };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// async function downloadModuleUpdate(asset) {
//   const targetPath = join(completeDir, asset.name);
//   if (fs.existsSync(targetPath)) {
//     return targetPath;
//   }

//   const tempPath = join(pendingDir, asset.name);
//   await downloadFile(asset.browser_download_url, tempPath);
//   await ensureDirExists(completeDir);
//   await fs.promises.rename(tempPath, targetPath);
//   return targetPath;
// }

// check cache for junk and remove
function checkCache() {
  for (const key in updateCache) {
    if (Object.hasOwnProperty.call(updateCache, key)) {
      if (Date.now() - cacheStaleTime * 4 > updateCache[key].time) {
        console.log('I found extreme stale key', key);
        delete updateCache[key];
      }
    }
  }
}

export async function checkForModuleUpdates() {
  const state = store.getState();
  updateCache = JSON.parse(cache.getItem('updateCache')) || {};
  const modules = Object.values(state.modules);
  const cache = loadCache();

  const updateableModules = modules
    .filter((module) => !module.development && !!module.repository)
    .sort((a, b) =>
      a.hasNewVersion === b.hasNewVersion ? 1 : a.hasNewVersion ? 1 : -1
    );
  const results = await Promise.allSettled(
    updateableModules.map((m) => checkForModuleUpdate(m, { cache }))
  );
  const updates = results
    .filter(({ status, value }) => value && status === 'fulfilled')
    .map(({ value }) => value);
  saveCache(cache);

  cache.setItem('updateCache', JSON.stringify(updateCache));
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

  const updatesMapping = updates.reduce(
    (map, { module, latestVersion, latestRelease }) => {
      map[module.info.name] = {
        version: latestVersion,
        release: latestRelease,
      };
      return map;
    },
    {}
  );
  store.dispatch({
    type: TYPE.UPDATE_MODULES_LATEST,
    payload: updatesMapping,
  });
}
