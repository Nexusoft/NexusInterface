import { join, isAbsolute, normalize } from 'path';
import fs from 'fs';
import Ajv from 'ajv';
import semver from 'semver';

import store from 'store';
import { semverRegex } from 'consts/misc';
import * as TYPE from 'consts/actionTypes';
import { modulesDir } from 'consts/paths';
import { walletEvents } from 'lib/wallet';

import {
  loadRepoInfo,
  isRepoOnline,
  isModuleVerified,
  isRepoFromNexus,
  getModuleHash,
} from './repo';

const ajv = new Ajv();
// Reserved file names, modules are not allowed to have one of these in their `files` field
const reservedFileNames = [
  'nxs_package.json',
  'repo_info.json',
  'storage.json',
];

/**
 * =============================================================================
 * nxs_package.json schema
 * =============================================================================
 */
const nxsPackageSchema = {
  additionalProperties: false,
  required: ['name', 'displayName', 'version', 'type', 'files'],
  properties: {
    name: {
      type: 'string',
      // Allows lowercase letters, digits, underscore and dash, but must have at least one lowercase letter
      pattern: '^[0-9a-z_-]*[a-z][0-9a-z_-]*$',
    },
    // A user-friendly name to be displayed on the GUI
    displayName: { type: 'string', pattern: '^[^\n]*$' },
    version: {
      type: 'string',
      pattern: semverRegex.source,
    },
    // Wallet version that this module was built for and tested on
    targetWalletVersion: {
      type: 'string',
      pattern: semverRegex.source,
    },
    // DEPRECATED! This is added so that old modules is recognized
    specVersion: {
      type: 'string',
      pattern: semverRegex.source,
    },
    description: { type: 'string' },
    type: { type: 'string', enum: ['app'] },
    options: {
      type: 'object',
      properties: {
        wrapInPanel: { type: 'boolean' },
      },
    },
    // Relative path to the entry file
    // Main file could be html or js depending on module's type
    // If not specified, app will look for index.html or index.js depending on module type
    entry: {
      type: 'string',
      // Allows empty strings, disallows ../ and ..\
      pattern: /^(.(?<!\.\.\/|\.\.\\))+$|^$/.source,
    },
    // Relative path to the icon file
    // Currently svg and png formats are supported
    // If not specified, app will look for icon.svg and icon.png
    icon: {
      type: 'string',
      // Checks for file extension, allows empty strings, disallows ../ and ..\
      pattern: /^(.(?<!\.\.\/|\.\.\\))+\.(svg|png)$|^$/.source,
    },

    author: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
    },
    // Lists ALL the files which is used by the module in relative paths from the module directory
    // including files specified in `entry` and `icon` fields
    // excluding `nxs_package.json`, `repo_info.json` and `storage.json`
    files: {
      type: 'array',
      items: {
        type: 'string',
        // Disallows ../ and ..\
        pattern: /^(.(?<!\.\.\/|\.\.\\))+$/.source,
      },
    },
  },
};
const validateNxsPackage = ajv.compile(nxsPackageSchema);

/**
 * =============================================================================
 * nxs_package.dev.json schema
 * =============================================================================
 */
const nxsPackageDevSchema = {
  additionalProperties: true,
  required: ['name', 'displayName', 'type'],
  properties: {
    name: {
      type: 'string',
    },
    displayName: { type: 'string' },
    description: { type: 'string' },
    type: { type: 'string', enum: ['app'] },
  },
};
const validateNxsPackageDev = ajv.compile(nxsPackageDevSchema);

/**
 * =============================================================================
 * Private functions
 * =============================================================================
 */

/**
 * Check if a directory contains symbolic links
 *
 * @param {*} dirPath
 * @returns
 */
async function containsSymLink(dirPath) {
  const items = await fs.promises.readdir(dirPath);
  for (let item of items) {
    const subPath = join(dirPath, item);
    const stat = await fs.promises.lstat(subPath);
    return (
      stat.isSymbolicLink() ||
      (stat.isDirectory() && (await containsSymLink(subPath)))
    );
  }
  return false;
}

/**
 * Load module info from nxs_package.json
 *
 * @param {*} dirPath
 * @returns
 */
async function loadModuleInfo(dirPath) {
  const nxsPackagePath = join(dirPath, 'nxs_package.json');
  const stat = await fs.promises.lstat(nxsPackagePath);
  if (
    !fs.existsSync(nxsPackagePath) ||
    !stat.isFile() ||
    stat.isSymbolicLink()
  ) {
    return null;
  }
  const content = await fs.promises.readFile(nxsPackagePath);
  return JSON.parse(content);
}

/**
 * Load module dev info from nxs_package.dev.json
 *
 * @param {*} dirPath
 * @returns
 */
async function loadModuleDevInfo(dirPath) {
  const nxsPackageDevPath = join(dirPath, 'nxs_package.dev.json');
  const content = await fs.promises.readFile(nxsPackageDevPath);
  return JSON.parse(content);
}

/**
 * Check if module info is valid
 *
 * @param {*} moduleInfo
 * @param {*} dirPath
 * @returns
 */
async function validateModuleInfo(moduleInfo, dirPath) {
  if (!validateNxsPackage(moduleInfo)) {
    console.log(validateNxsPackage.errors);
    return false;
  }

  // targetWalletVersion is mandatory for modules in new schema
  if (!moduleInfo.targetWalletVersion && !moduleInfo.specVersion) return false;

  // Ensure all file paths are relative
  if (moduleInfo.entry && isAbsolute(moduleInfo.entry)) return false;
  if (moduleInfo.icon && isAbsolute(moduleInfo.icon)) return false;
  if (moduleInfo.files.some(file => isAbsolute(file))) return false;
  if (
    moduleInfo.files.some(file => reservedFileNames.includes(normalize(file)))
  )
    return false;

  // Ensure all files exist and are not directories
  const filePaths = moduleInfo.files.map(file => join(dirPath, file));
  if (
    filePaths.some(path => !fs.existsSync(path)) ||
    (
      await Promise.all(filePaths.map(path => fs.promises.stat(path)))
    ).some(stat => stat.isDirectory())
  ) {
    console.error(
      `Module ${moduleInfo.name}: Some files listed by the module does not exist`
    );
    return false;
  }

  // Ensure no symbolic links, both files and folders
  // Need to scan the whole folder because symbolic link can link to a directory
  const {
    settings: { devMode, allowSymLink },
  } = store.getState();
  if (!(devMode && allowSymLink) && (await containsSymLink(dirPath))) {
    console.error(`Module ${moduleInfo.name} contains some symbolic link!`);
    return false;
  }

  // Module type specific checks
  if (moduleInfo.type === 'app') {
    // Check entry extension corresponding to module type
    if (moduleInfo.entry && !moduleInfo.entry.endsWith('.html')) {
      return false;
    }
  }

  return true;
}

/**
 * Check if module dev info is valid
 *
 * @param {*} moduleInfo
 * @returns
 */
function validateModuleDevInfo(moduleInfo) {
  return validateNxsPackageDev(moduleInfo);
}

/**
 * Get the path of an icon if the file does exist
 *
 * @param {*} iconName
 * @param {*} dirPath
 * @returns
 */
function getIconPathIfExists(iconName, dirPath) {
  const iconPath = join(dirPath, iconName);
  return fs.existsSync(iconPath) ? iconPath : null;
}

/**
 * Find the icon path for a module
 *
 * @param {*} moduleInfo
 * @returns
 */
function getModuleIconPath(module) {
  return module.info.icon
    ? getIconPathIfExists(module.info.icon, module.path)
    : getIconPathIfExists('icon.svg', module.path) ||
        getIconPathIfExists('icon.png', module.path);
}

/**
 * Fill extra info about the module
 *
 * @memberof Module
 */
async function initializeModule(module) {
  // Check the repository info and verification
  module.hash = await getModuleHash(module);
  const repoInfo = await loadRepoInfo(module.path);
  if (repoInfo) {
    module.repository = repoInfo.data.repository;
    const [repoOnline, repoVerified, repoFromNexus] = await Promise.all([
      isRepoOnline(module.repository),
      isModuleVerified(module, repoInfo),
      isRepoFromNexus(module.repository),
    ]);
    Object.assign(module, {
      repoOnline,
      repoVerified,
      repoFromNexus,
    });
  }

  const {
    settings: { devMode, verifyModuleSource, disabledModules },
  } = store.getState();
  module.incompatible =
    !module.info.targetWalletVersion ||
    semver.lt(module.info.targetWalletVersion, BACKWARD_COMPATIBLE_VERSION);
  module.disallowed = !(
    (devMode && !verifyModuleSource) ||
    (module.repo.repository && module.repo.online && module.repo.verified)
  );
  module.enabled =
    !module.disallowed && !disabledModules.includes(module.info.name);

  return module;
}

/**
 * =============================================================================
 * Nexus Wallet Module
 * =============================================================================
 *
 * @export
 * @class Module
 */
export default class Module {
  constructor(moduleInfo, path) {
    this.info = moduleInfo;
    this.path = path;
    this.iconPath = getModuleIconPath(this);
  }

  /**
   * Load a module from a directory
   *
   * @static
   * @param {*} dirPath
   * @returns
   * @memberof Module
   */
  static async loadFromDir(dirPath) {
    try {
      const moduleInfo = await loadModuleInfo(dirPath);
      const isValid = await validateModuleInfo(moduleInfo, dirPath);
      if (!isValid) return null;

      const module = new Module(moduleInfo, dirPath);
      return await initializeModule(module);
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Load a development module from a directory
   *
   * @static
   * @param {*} dirPath
   * @returns
   * @memberof Module
   */
  static async loadDevFromDir(dirPath) {
    try {
      const moduleInfo = await loadModuleDevInfo(dirPath);
      const isValid = await validateModuleDevInfo(moduleInfo);
      if (!isValid) return null;

      const module = new Module(moduleInfo, dirPath);
      module.development = true;
      module.enabled = true;
      return module;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

/**
 * Load all installed modules from the app modules directory.
 * Only called once when the wallet is started.
 */
walletEvents.once('pre-render', async function() {
  try {
    if (!fs.existsSync(modulesDir)) return {};
    const { devModulePaths = [] } = store.getState().settings;
    const dirNames = await fs.promises.readdir(modulesDir);
    const dirPaths = dirNames.map(dirName => join(modulesDir, dirName));
    const moduleList = await Promise.all([
      ...devModulePaths.map(path => Module.loadDevFromDir(path)),
      ...dirPaths.map(path => Module.loadFromDir(path)),
    ]);

    const modules = moduleList.reduce((map, module) => {
      if (module) {
        const { name, version } = module.info;
        try {
          if (!map[name] || semver.gt(version, map[name].version)) {
            map[name] = module;
          }
        } catch (err) {
          // In case version is blank or invalid semver
          // don't break the whole process
          console.error(err);
        }
      }
      return map;
    }, {});

    store.dispatch({
      type: TYPE.LOAD_MODULES,
      payload: modules,
    });
  } catch (err) {
    console.error(err);
    return {};
  }
});

export function addDevModule(module) {
  return store.dispatch({
    type: TYPE.ADD_DEV_MODULE,
    payload: module,
  });
}
