import { join, extname, dirname, normalize } from 'path';
import fs from 'fs';

import UIController from 'components/UIController';
import store from 'store';
import { validateModule } from 'api/modules';
import config from 'api/configuration';
import deleteDirectory from 'utils/promisified/deleteDirectory';
import extractZip from 'utils/promisified/extractZip';
import confirm from 'utils/promisified/confirm';

import ModuleDetailsModal from './ModuleDetailsModal';

// Temp directory for extracting module before installing
const tempModuleDir = join(config.GetAppDataDirectory(), '.temp_module');

/**
 * Install a module from either an archive file or a directory.
 * In case of an archive file, it will be extracted to a
 * temp directory then continue to install from that directory.
 *
 * @export
 * @param {string} path
 * @returns
 */
export default async function installModule(path) {
  try {
    if (!fs.existsSync(path)) {
      UIController.showNotification('Cannot find module', 'error');
      return;
    }
    let dirPath = path;

    if (fs.statSync(path).isFile()) {
      if (extname(path) !== '.zip') {
        UIController.showNotification('Unsupported file type', 'error');
        return;
      }

      if (fs.existsSync(tempModuleDir)) {
        await deleteDirectory(tempModuleDir);
      }

      await extractZip(path, { dir: tempModuleDir });
      dirPath = tempModuleDir;

      // In case the module is wrapped inside a sub directory of the archive file
      const subItems = await fs.promises.readdir(tempModuleDir);
      if (subItems.length === 1) {
        const subItemPath = join(tempModuleDir, subItems[0]);
        if (fs.statSync(subItemPath).isDirectory()) {
          dirPath = subItemPath;
        }
      }
    } else {
      const modulesDir = normalize(config.GetModulesDir());
      const dirPath = normalize(path);
      if (dirPath.startsWith(modulesDir)) {
        UIController.showNotification('Invalid module location', 'error');
        return;
      }
    }

    await installFromDirectory(dirPath);
  } catch (err) {
    console.error(err);
    UIController.showNotification('An unknown error occurred', 'error');
    return;
  }
}

/**
 * Install a module from a directory
 *
 * @param {string} path
 * @returns
 */
async function installFromDirectory(path) {
  const {
    settings: { devMode, verifyModuleSource },
  } = store.getState();
  const module = await validateModule(path, { devMode, verifyModuleSource });

  if (!module) {
    UIController.showNotification('Invalid Module', 'error');
    return;
  }

  UIController.openModal(ModuleDetailsModal, {
    module,
    forInstall: true,
    install: async () => {
      try {
        const dest = join(config.GetModulesDir(), module.name);
        if (fs.existsSync(dest)) {
          const agreed = await confirm({
            question: 'Overwrite module?',
            note: 'A module with the same directory name already exists',
          });
          if (!agreed) return;

          await deleteDirectory(dest, { glob: false });
        }

        await copyModule(module.files, path, dest);

        UIController.openSuccessDialog({
          message: 'Module has been successfully installed',
          note:
            'The wallet will now be refreshed for the new module to take effect',
          onClose: () => {
            location.reload();
          },
        });
      } catch (err) {
        console.error(err);
        UIController.showNotification('Error copying module files', 'error');
        return;
      }
    },
  });
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
