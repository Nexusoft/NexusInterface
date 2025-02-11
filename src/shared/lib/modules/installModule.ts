import axios from 'axios';
import extractZip from 'extract-zip';
import fs from 'fs';
import https from 'https';
import { dirname, join, normalize } from 'path';

import ModuleDetailsModal from 'components/ModuleDetailsModal';
import { modulesDir, walletDataDir } from 'consts/paths';
import { rm as deleteDirectory } from 'fs/promises';
import { confirm, openErrorDialog, openSuccessDialog } from 'lib/dialog';
import { settingsAtom, updateSettings } from 'lib/settings';
import { store } from 'lib/store';
import { openModal, showNotification } from 'lib/ui';
import UT from 'lib/usageTracking';
import ensureDirExists from 'utils/ensureDirExists';
import { throttled } from 'utils/universal';

import { ClientRequest } from 'http';
import { moduleDownloadsAtom, modulesMapAtom } from './atoms';
import { loadDevModuleFromDir, loadModuleFromDir } from './module';
import { fetchGithubLatestRelease, getRepoId } from 'lib/github';

__ = __context('Settings.Modules');

// Temp directory for extracting module before installing
const tempModuleDir = join(walletDataDir, '.temp_module');
const supportedExtensions = ['.zip'];

/**
 * Copy a module file from source to dest
 */
function copyFile(file: string, source: string, dest: string) {
  return fs.promises.copyFile(join(source, file), join(dest, file));
}

/**
 * Copy all files of a module from source to the destination
 * including nxs_package.json and repo_info.json
 */
async function copyModule(files: string[], source: string, dest: string) {
  // Create all the missing sub-directories sequentially first
  // The creations would be duplicated if they're parallel
  for (let file of files) {
    const dir = dirname(join(dest, file));
    await ensureDirExists(dir);
  }

  const promises = [
    copyFile('nxs_package.json', source, dest),
    ...files.map((file) => copyFile(file, source, dest)),
  ];
  if (fs.existsSync(join(source, 'repo_info.json'))) {
    promises.push(copyFile('repo_info.json', source, dest));
  }
  return await Promise.all(promises);
}

/**
 * Install a module from a directory
 */
function doInstall(path: string) {
  return new Promise(async (resolve) => {
    let module;
    try {
      module = await loadModuleFromDir(path);
    } catch (err: any) {
      openErrorDialog({
        message: __('Failed to load module'),
        note: err?.message,
      });
    }

    if (!module) return resolve(undefined);

    openModal(ModuleDetailsModal, {
      module,
      onClose: () => resolve(undefined),
      install: async () => {
        try {
          const dest = join(modulesDir, module.info.name);
          if (fs.existsSync(dest)) {
            const agreed = await confirm({
              question: __('Overwrite module?'),
              note: __('A module with the same directory name already exists'),
            });
            if (!agreed) return;

            await deleteDirectory(dest, { recursive: true, force: true });
          }

          await copyModule(module.info.files, path, dest);
          UT.InstallModule(module.info.name);
          resolve(dest);
          openSuccessDialog({
            message: __('Module has been successfully installed'),
            note: __(
              'The wallet will now be refreshed for the new module to take effect'
            ),
            onClose: () => {
              location.reload();
            },
          });
        } catch (err: any) {
          console.error(err);
          openErrorDialog({
            message: __('Failed to install module'),
            note: err?.message,
          });
          return resolve(undefined);
        }
      },
    });
  });
}

/**
 * Install a module from either an archive file or a directory.
 * In case of an archive file, it will be extracted to a
 * temp directory then continue to install from that directory.
 */
export async function installModule(path: string) {
  try {
    if (!fs.existsSync(path)) {
      showNotification(__('Cannot find module'), 'error');
      return;
    }
    let sourcePath = path;

    if ((await fs.promises.stat(path)).isFile()) {
      if (!supportedExtensions.some((ext) => path.endsWith(ext))) {
        showNotification(__('Unsupported file type'), 'error');
        return;
      }

      if (fs.existsSync(tempModuleDir)) {
        await deleteDirectory(tempModuleDir, { recursive: true, force: true });
      }

      if (path.endsWith('.zip')) {
        await extractZip(path, { dir: tempModuleDir });
      }
      sourcePath = tempModuleDir;

      // In case the module is wrapped inside a sub directory of the archive file
      const subItems = await fs.promises.readdir(tempModuleDir);
      if (subItems.length === 1) {
        const subItemPath = join(tempModuleDir, subItems[0]);
        if ((await fs.promises.stat(subItemPath)).isDirectory()) {
          sourcePath = subItemPath;
        }
      }
    } else {
      const sourcePath = normalize(path);
      if (sourcePath.startsWith(normalize(modulesDir))) {
        showNotification(__('Cannot install from this location'), 'error');
        return;
      }
    }

    await doInstall(sourcePath);
  } catch (err: any) {
    console.error(err);
    openErrorDialog({
      message: __('Failed to load module'),
      note: err?.message,
    });
    return;
  }
}

export async function addDevModule(dirPath: string) {
  const { devModulePaths } = store.get(settingsAtom);
  if (devModulePaths.includes(dirPath)) {
    openErrorDialog({
      message: __('Directory has already been added'),
    });
    return;
  }

  let module;
  try {
    module = await loadDevModuleFromDir(dirPath);
  } catch (err: any) {
    openErrorDialog({
      message: __('Failed to load development module'),
      note: err?.message,
    });
  }
  if (!module) return;

  const modulesMap = store.get(modulesMapAtom);
  if (modulesMap[module.info.name]) {
    openErrorDialog({
      message: __('A module with the same name already exists'),
    });
    return;
  }

  updateSettings({ devModulePaths: [dirPath, ...devModulePaths] });
  store.set(modulesMapAtom, (modulesMap) => ({
    ...modulesMap,
    [module?.info.name]: module,
  }));
  openSuccessDialog({
    message: __('Development module has been added'),
  });
}

export interface ModuleDownload {
  // Downloaded size in bytes
  downloaded?: number;
  // Total size in bytes
  totalSize?: number;
  downloading?: boolean;
  downloadRequest?: ClientRequest;
}

// Mapping from module name to download request object of that module
let downloadRequests: Record<string, ClientRequest | null> = {};
export const getDownloadRequest = (moduleName: string) =>
  downloadRequests[moduleName];

const updateDownloadProgress = throttled(
  ({
    moduleName,
    downloaded,
    totalSize,
    downloadRequest,
  }: {
    moduleName: string;
    downloaded: number;
    totalSize: number;
    downloadRequest: ClientRequest;
  }) => {
    downloadRequests[moduleName] = downloadRequest;
    store.set(moduleDownloadsAtom, (downloads) => ({
      ...downloads,
      [moduleName]: {
        downloaded,
        totalSize,
        downloading: !!downloadRequest,
      },
    }));
  },
  1000
);

function download(
  url: string,
  { moduleName, filePath }: { moduleName: string; filePath: string }
) {
  return new Promise<string | null>((resolve, reject) => {
    const downloadRequest = https
      .get(url)
      .setTimeout(180000)
      .on('response', (response) => {
        if (
          String(response.statusCode).startsWith('3') &&
          response.headers.location
        ) {
          // Redirecting
          download(response.headers.location, {
            moduleName,
            filePath,
          })
            .then(resolve)
            .catch(reject);
          return;
        }

        const totalSize = parseInt(
          response.headers['content-length'] || '',
          10
        );

        let downloaded = 0;
        const file = fs.createWriteStream(filePath);

        response
          .on('data', (chunk) => {
            downloaded += chunk.length;
            updateDownloadProgress({
              moduleName,
              downloaded,
              totalSize,
              downloadRequest,
            });
          })
          .on('close', () => {
            resolve(filePath);
          })
          .on('error', (err) => {
            reject(err);
          })
          .pipe(file);
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('timeout', function () {
        if (downloadRequest) downloadRequest.abort();
        reject(new Error('Request timeout!'));
      })
      .on('abort', function () {
        resolve(null);
      });
  });
}

interface Asset {
  name: string;
  browser_download_url: string;
}

async function downloadAsset({
  moduleName,
  asset,
}: {
  moduleName: string;
  asset: Asset;
}) {
  const dirPath = join(walletDataDir, '.downloads');
  let dirStat;
  try {
    dirStat = await fs.promises.stat(dirPath);
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      // Create directory if it doesn't exist
      await fs.promises.mkdir(dirPath, { recursive: true });
    } else {
      throw err;
    }
  }
  if (dirStat && !dirStat.isDirectory()) {
    throw new Error(`${dirPath} is not a directory`);
  }

  const filePath = join(dirPath, asset.name);
  return download(asset.browser_download_url, { moduleName, filePath });
}

export async function downloadAndInstall({
  moduleName,
  owner,
  repo,
  releaseId,
}: {
  moduleName: string;
  owner: string;
  repo: string;
  releaseId: number | 'latest';
}) {
  let filePath: string | null = null;
  try {
    store.set(moduleDownloadsAtom, (downloads) => ({
      ...downloads,
      [moduleName]: {},
    }));

    if (releaseId === 'latest') {
      const { data: release } = await fetchGithubLatestRelease(
        getRepoId({ owner, repo }),
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      releaseId = release.id;
    }

    const { data: releaseAssets } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/releases/${releaseId}/assets`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    const asset = (releaseAssets as Asset[]).find(
      ({ name }) => name.startsWith(moduleName) && name.endsWith('.zip')
    );
    if (!asset) {
      openErrorDialog({
        message: __('Cannot find module archive file among assets'),
      });
      return;
    }
    filePath = await downloadAsset({
      moduleName,
      asset: asset,
    });

    if (filePath) {
      await installModule(filePath);
    }
  } catch (err: any) {
    openErrorDialog({
      message: __('Error downloading module'),
      note: err?.message,
    });
  } finally {
    downloadRequests[moduleName] = null;
    store.set(moduleDownloadsAtom, (downloads) => ({
      ...downloads,
      [moduleName]: null,
    }));
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(err);
      });
    }
  }
}

export function abortModuleDownload(moduleName: string) {
  const downloadRequest = getDownloadRequest(moduleName);
  return downloadRequest?.abort();
}
