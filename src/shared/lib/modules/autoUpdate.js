// import fs from 'fs';
// import { join } from 'path';
import axios from 'axios';

import store from 'store';
import * as TYPE from 'consts/actionTypes';
// import { walletDataDir } from 'consts/paths';
// import ensureDirExists from 'utils/ensureDirExists';
// import downloadFile from 'utils/downloadFile';

// const pendingDir = join(walletDataDir, 'module_updates', 'pending');
// const completeDir = join(walletDataDir, 'module_updates', 'complete');

const githubHeaders = {
  Accept: 'application/vnd.github.v3+json',
};

const getAssetName = (name, version) => `${name}_v${version}.zip`;

async function getLatestRelease(repo) {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`;
  try {
    const response = await axios.get(url, {
      headers: githubHeaders,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function checkForModuleUpdate(module) {
  if (!module.repository) return null;
  const release = await getLatestRelease(module.repository);
  if (!release || !release.tag_name || !release.assets) return null;

  const latestVersion = release.tag_name.startsWith('v')
    ? release.tag_name.substring(1)
    : release.tag_name;
  if (
    !semver.valid(latestVersion) ||
    !semver.gt(latestVersion, module.info.version)
  )
    return null;

  return { module, latestVersion, latestRelease: release };

  // const assetName = getAssetName(module.info.name, latestVer);
  // const asset = latest.assets.find(a => a.name === assetName);
  // if (!asset) return null;

  // return { module, asset };
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

export async function checkForModuleUpdates() {
  const state = store.getState();
  const modules = Object.values(state.modules);
  const updateableModules = modules.filter(
    module => !module.development && !!module.repository
  );
  const results = await Promise.allSettled(
    updateableModules.map(m => checkForModuleUpdate(m))
  );
  const updates = results
    .filter(({ status, value }) => value && status === 'fulfilled')
    .map(({ value }) => value)
    .reduce((map, { module, latestVersion, release }) => {
      map[module.info.name] = {
        version: latestVersion,
        release: latestRelease,
      };
      return map;
    }, {});

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

    store.dispatch({
      type: TYPE.UPDATE_MODULES_LATEST,
      payload: updates,
    });
  }
}
