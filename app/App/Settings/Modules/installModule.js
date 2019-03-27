import { join, extname } from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import extractZip from 'extract-zip';

import UIController from 'components/UIController';
import store from 'store';
import { validateModule } from 'api/modules';
import config from 'api/configuration';

import ModuleDetailsModal from './ModuleDetailsModal';

// Temp directory for extracting module before installing
const tempModuleDir = join(config.GetAppDataDirectory(), '.temp_module');

export default async function installModule(path) {
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

        await fs.promises.mkdir(dest);
        await copyModuleOver(module.files, path, dest);
        location.reload();
      } catch (err) {
        console.error(err);
        UIController.showNotification('Error copying module files', 'error');
        return;
      }
    },
  });
}

function copyModuleOver(files, source, dest) {
  const promises = [
    fs.promises.copyFile(
      join(source, 'nxs_package.json'),
      join(dest, 'nxs_package.json')
    ),
    ...files.map(file =>
      fs.promises.copyFile(join(source, file), join(dest, file))
    ),
  ];
  if (existsSync(join(source, 'repo_info.json'))) {
    promises.push(
      fs.promises.copyFile(
        join(source, 'repo_info.json'),
        join(dest, 'repo_info.json')
      )
    );
  }
  return Promise.all(promises);
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
      reject(err);
    }
  });
}
