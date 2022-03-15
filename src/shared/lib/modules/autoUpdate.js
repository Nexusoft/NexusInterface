// import fs from 'fs';
// import { join } from 'path';
import axios from 'axios';
import semver from 'semver';

import store from 'store';
import * as TYPE from 'consts/actionTypes';
import { showNotification } from 'lib/ui';
import { navigate } from 'lib/wallet';
// import { walletDataDir } from 'consts/paths';
// import ensureDirExists from 'utils/ensureDirExists';
// import downloadFile from 'utils/downloadFile';

// const pendingDir = join(walletDataDir, 'module_updates', 'pending');
// const completeDir = join(walletDataDir, 'module_updates', 'complete');

//If expanded consider moving to own file.
const cache = window.localStorage;
const cacheStaleTime = 1000 * 60 * 60 * 24 * 7;

// const getAssetName = (name, version) => `${name}_v${version}.zip`;

async function getLatestRelease(repo) {
  const repoId = `${repo.owner}/${repo.repo}`;
  const url = `https://api.github.com/repos/${repoId}/releases/latest`;
  let repoCache = JSON.parse(cache.getItem(repoId));
  if (repoCache && Date.now() - cacheStaleTime > repoCache.time) {
    removeUpdateCache(repo.repo);
    repoCache = null;
  }
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
    cache.setItem(repoId, JSON.stringify(cacheObj));
    return response.data;
  } catch (err) {
    if (err.response?.status === 304) {
      // 304 = Not modified
      return repoCache;
    }
    console.error(err);
    return null;
  }
}

async function checkForModuleUpdate(module) {
  try {
    if (!module.repository) return null;
    const release = await getLatestRelease(module.repository);
    if (!release || !release.tag_name || !release.assets) return null;

    const latestVersion = release.tag_name.startsWith('v')
      ? release.tag_name.substring(1)
      : release.tag_name;
    if (
      !semver.valid(latestVersion) ||
      !semver.valid(module.info.version) ||
      !semver.gt(latestVersion, module.info.version)
    )
      return null;

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

// Every month, check cache for junk and remove
function checkCache() {
  const cleanDate = cache.getItem('cleanDate');
  if (
    !cleanDate ||
    (cleanDate && Date.now() - cacheStaleTime * 4 > cleanDate)
  ) {
    let dirty = [];
    for (let i = 0; i < cache.length; i++) {
      if (
        Date.now() - cacheStaleTime >
        JSON.parse(cache.getItem(cache.key(i))).time
      ) {
        dirty.push(cache.key(i));
      }
    }
    dirty.forEach((e) => cache.removeItem(e));
    cache.setItem('cleanDate', (Date.now() + cacheStaleTime * 4).toString());
  }
}

export async function checkForModuleUpdates() {
  const state = store.getState();
  const modules = Object.values(state.modules);
  const updateableModules = modules
    .filter((module) => !module.development && !!module.repository)
    .sort((a, b) =>
      a.hasNewVersion === b.hasNewVersion ? 1 : a.hasNewVersion ? 1 : -1
    );
  const results = await Promise.allSettled(
    updateableModules.map((m) => checkForModuleUpdate(m))
  );
  const updates = results
    .filter(({ status, value }) => value && status === 'fulfilled')
    .map(({ value }) => value);
  checkCache();
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

export function removeUpdateCache(repo) {
  console.log(`${repo} is stale and removed`);
  cache.removeItem(repo);
}
