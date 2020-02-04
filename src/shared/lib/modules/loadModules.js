import { join } from 'path';
import fs from 'fs';
import semver from 'semver';

import * as TYPE from 'consts/actionTypes';
import store from 'store';
import { modulesDir } from 'consts/paths';
import { loadModuleFromDir } from './loadModuleFromDir';
import { walletEvents } from 'lib/wallet';

/**
 * Get the path of an icon if the file does exist
 *
 * @param {*} iconName
 * @param {*} dirName
 * @returns
 */
function getIconPathIfExists(iconName, dirName) {
  const iconPath = join(modulesDir, dirName, iconName);
  return fs.existsSync(iconPath) ? iconPath : null;
}

/**
 * Add some necessary pre-calculated data to module object before returning modules to the app
 *
 * @param {*} module
 * @returns
 */
function prepareModule(module) {
  // Prepare module icon
  module.iconPath = module.icon
    ? getIconPathIfExists(module.icon, module.dirName)
    : getIconPathIfExists('icon.svg', module.dirName) ||
      getIconPathIfExists('icon.png', module.dirName);

  return module;
}

/**
 * Load all installed modules from the app modules directory.
 * Only called once when the wallet is started.
 *
 * @param {*} { devMode, verifyModuleSource }
 * @returns {object} an object mapping module names and module data
 */
walletEvents.once('pre-render', async function() {
  try {
    if (!fs.existsSync(modulesDir)) return {};
    const dirNames = await fs.promises.readdir(modulesDir);
    const dirPaths = dirNames.map(dirName => join(modulesDir, dirName));
    const results = await Promise.all(
      dirPaths.map(path => loadModuleFromDir(path))
    );

    const modules = results.reduce((map, result, i) => {
      if (result) {
        const module = { ...result, dirName: dirNames[i] };
        // If 2 modules have the same name, keep the one with the higher version
        if (
          !map[module.name] ||
          semver.gt(module.version, map[module.name].version)
        ) {
          map[module.name] = prepareModule(module);
        }
      }
      return map;
    }, {});

    store.dispatch({
      type: TYPE.LOAD_MODULES,
      payload: modules,
    });
  } catch (err) {
    return {};
  }
});
