import { join, extname } from 'path';
import { existsSync, promises, statSync } from 'fs';
import rimraf from 'rimraf';
import extractZip from 'extract-zip';

import UIController from 'components/UIController';
import store from 'store';
import config from 'api/configuration';

import ModuleDetailsModal from './ModuleDetailsModal';

// Temp directory for extracting module before installing
const tempModuleDir = join(config.GetAppDataDirectory(), '.temp_module');

export default async function installModule(path) {
  if (!existsSync(path)) {
    UIController.showNotification('Cannot find module', 'error');
    return;
  }

  let dirPath = path;
  if (statSync(path).isFile()) {
    if (extname(path) !== '.zip') {
      UIController.showNotification('Unsupported file type', 'error');
      return;
    }

    if (existsSync(tempModuleDir)) {
      await deleteDirectory(tempModuleDir);
    }

    await extract(path, { dir: tempModuleDir });
    dirPath = tempModuleDir;
  }

  await installFromDirectory(dirPath);
}

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
      const dest = join(config.GetModulesDir, module.name);
      if (existsSync(dest)) {
        const agreed = await confirm({
          question: 'Overwrite module?',
          note: 'A module with the same directory name already exists',
        });
        if (!agreed) return;

        await deleteDirectory(dest, { glob: false });
      }

      await copyModuleOver(module.files, path, dest);
      location.reload();
    },
  });
}

function copyModuleOver(files, origin, dest) {
  return Promise.all([
    promises.copyFile(
      join(origin, 'nxs_package.json'),
      join(dest, 'nxs_package.json')
    ),
    ...files.map(file =>
      promises.copyFile(join(origin, file), join(dest, file))
    ),
  ]);
}

// TODO: make this a common utility
function confirm(options) {
  return new Promise((resolve, reject) => {
    try {
      UIController.openConfirmDialog({
        ...options,
        yesCallback: () => {
          resolve(true);
        },
        noCallback: () => {
          resolve(false);
        },
      });
    } catch (err) {
      reject(err);
    }
  });
}

// TODO: make this a common utility
function deleteDirectory(path, options) {
  return new Promise((resolve, reject) => {
    try {
      rimraf(path, options, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

// TODO: make this a common utility
function extract(source, options) {
  return new Promise((resolve, reject) => {
    try {
      extractZip(source, options, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
