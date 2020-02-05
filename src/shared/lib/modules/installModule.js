import { join, dirname, normalize } from 'path';
import fs from 'fs';

import { showNotification, openModal, openSuccessDialog } from 'lib/ui';
import ModuleDetailsModal from 'components/ModuleDetailsModal';
import { modulesDir } from 'consts/paths';
import { walletDataDir } from 'consts/paths';
import deleteDirectory from 'utils/promisified/deleteDirectory';
import extractZip from 'utils/promisified/extractZip';
import extractTarball from 'utils/promisified/extractTarball';
import confirm from 'utils/promisified/confirm';

import Module from './Module';

__ = __context('Settings.Modules');

// Temp directory for extracting module before installing
const tempModuleDir = join(walletDataDir, '.temp_module');
const supportedExtensions = ['.zip', '.tar.gz'];

/**
 * Copy a module file from source to dest
 *
 * @param {*} file - file's relative path from source
 * @param {*} source
 * @param {*} dest
 * @returns
 */
function copyFile(file, source, dest) {
  return fs.promises.copyFile(join(source, file), join(dest, file));
}

/**
 * Node.js `mkdir`'s `recursive` option doesn't work somehow (last tested on node.js v10.11.0)
 * So we need to write it manually
 *
 * @param {string} path
 */
async function mkdirRecursive(path) {
  const parent = dirname(path);
  if (!fs.existsSync(parent)) {
    await mkdirRecursive(parent);
  }
  await fs.promises.mkdir(path);
}

/**
 * Copy all files of a module from source to the destination
 * including nxs_package.json and repo_info.json
 *
 * @param {*} files
 * @param {*} source
 * @param {*} dest
 * @returns
 */
async function copyModule(files, source, dest) {
  // Create all the missing sub-directories sequentially first
  // The creations would be duplicated if they're parallel
  for (let file of files) {
    const dir = dirname(join(dest, file));
    if (!fs.existsSync(dir)) {
      await mkdirRecursive(dir);
    }
  }

  const promises = [
    copyFile('nxs_package.json', source, dest),
    ...files.map(file => copyFile(file, source, dest)),
  ];
  if (fs.existsSync(join(source, 'repo_info.json'))) {
    promises.push(copyFile('repo_info.json', source, dest));
  }
  return await Promise.all(promises);
}

/**
 * Install a module from a directory
 *
 * @param {string} path
 * @returns
 */
async function doInstall(path) {
  const module = await Module.loadFromDir(path);

  if (!module) {
    showNotification('Invalid Module', 'error');
    return;
  }

  openModal(ModuleDetailsModal, {
    module,
    forInstall: true,
    install: async () => {
      try {
        const dest = join(modulesDir, module.info.name);
        if (fs.existsSync(dest)) {
          const agreed = await confirm({
            question: __('Overwrite module?'),
            note: __('A module with the same directory name already exists'),
          });
          if (!agreed) return;

          await deleteDirectory(dest, { glob: false });
        }

        await copyModule(module.info.files, path, dest);

        openSuccessDialog({
          message: __('Module has been successfully installed'),
          note: __(
            'The wallet will now be refreshed for the new module to take effect'
          ),
          onClose: () => {
            location.reload();
          },
        });
      } catch (err) {
        console.error(err);
        showNotification(__('Error copying module files'), 'error');
        return;
      }
    },
  });
}

/**
 * Install a module from either an archive file or a directory.
 * In case of an archive file, it will be extracted to a
 * temp directory then continue to install from that directory.
 *
 * @export
 * @param {string} path
 * @returns
 */
export async function installModule(path) {
  try {
    if (!fs.existsSync(path)) {
      showNotification(__('Cannot find module'), 'error');
      return;
    }
    let sourcePath = path;

    if ((await fs.promises.stat(path)).isFile()) {
      if (!supportedExtensions.some(ext => path.endsWith(ext))) {
        showNotification(__('Unsupported file type'), 'error');
        return;
      }

      if (fs.existsSync(tempModuleDir)) {
        await deleteDirectory(tempModuleDir);
      }

      if (path.endsWith('.zip')) {
        await extractZip(path, { dir: tempModuleDir });
      } else if (path.endsWith('.tar.gz')) {
        await extractTarball(path, tempModuleDir);
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
  } catch (err) {
    console.error(err);
    showNotification(__('An unknown error occurred'), 'error');
    return;
  }
}
