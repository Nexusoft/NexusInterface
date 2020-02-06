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

// Schema for nxs_package.json
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
 * =============================================================================
 * A Nexus Wallet Module
 * =============================================================================
 *
 * @export
 * @class Module
 */
export default class Module {
  constructor(moduleInfo, path) {
    this.info = moduleInfo;
    this.path = path;
  }

  /**
   * Load a module from directory
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
      await module.initialize();
      return module;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Fill in extra info about the module
   *
   * @memberof Module
   */
  async initialize() {
    this.iconPath = getModuleIconPath(this);

    this.hash = await getModuleHash(this);

    // Check the repository info and verification
    const repoInfo = await loadRepoInfo(this.path);
    if (repoInfo) {
      this.repository = repoInfo.data.repository;

      const [repoOnline, repoVerified, repoFromNexus] = await Promise.all([
        isRepoOnline(this.repository),
        isModuleVerified(this, repoInfo),
        isRepoFromNexus(this.repository),
      ]);
      Object.assign(this, {
        repoOnline,
        repoVerified,
        repoFromNexus,
      });
    }

    const {
      settings: { devMode, verifyModuleSource, disabledModules },
    } = store.getState();

    this.incompatible =
      !this.info.targetWalletVersion ||
      semver.lt(this.info.targetWalletVersion, BACKWARD_COMPATIBLE_VERSION);

    this.disallowed = !(
      (devMode && !verifyModuleSource) ||
      (this.repo.repository && this.repo.online && this.repo.verified)
    );

    this.enabled =
      !this.disallowed && !disabledModules.includes(this.info.name);
  }

  async initializeDev() {}
}

/**
 * Load all installed modules from the app modules directory.
 * Only called once when the wallet is started.
 */
walletEvents.once('pre-render', async function() {
  try {
    if (!fs.existsSync(modulesDir)) return {};
    const dirNames = await fs.promises.readdir(modulesDir);
    const dirPaths = dirNames.map(dirName => join(modulesDir, dirName));
    const modules = await Promise.all(
      dirPaths.map(path => Module.loadFromDir(path))
    );

    const moduleMapping = modules.reduce((map, module) => {
      if (module) {
        const { info } = module;
        if (
          !map[info.name] ||
          semver.gt(info.version, map[info.name].version)
        ) {
          map[info.name] = module;
        }
      }
      return map;
    }, {});

    store.dispatch({
      type: TYPE.LOAD_MODULES,
      payload: moduleMapping,
    });
  } catch (err) {
    return {};
  }
});
