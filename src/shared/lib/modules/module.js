import { join, isAbsolute, normalize, dirname } from 'path';
import fs from 'fs';
import Ajv from 'ajv';
import semver from 'semver';

import store from 'store';
import { semverRegex, emailRegex } from 'consts/misc';
import * as TYPE from 'consts/actionTypes';
import { modulesDir } from 'consts/paths';

import {
  loadRepoInfo,
  isRepoOnline,
  isModuleVerified,
  isRepoFromNexus,
  getModuleHash,
  getNexusOrgUsers,
} from './repo';
import { checkForModuleUpdates } from './autoUpdate';

const ajv = new Ajv();
// Reserved file names, modules are not allowed to have one of these in their `files` field
const reservedFileNames = [
  'nxs_package.json',
  'nxs_package.dev.json',
  'repo_info.json',
  'storage.json',
];

/**
 * =============================================================================
 * nxs_package.json schema
 * =============================================================================
 */
const nxsPackageSchema = {
  type: 'object',
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
        email: { type: 'string', pattern: emailRegex.source },
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
  type: 'object',
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
 * Get a list of upper folders of a path including that path
 *
 * @param {*} path
 * @returns
 */
function getAllUpperFolders(path) {
  const parent = dirname(path);
  if (parent !== '.' && parent !== '/' && parent !== path) {
    return [path, ...getAllUpperFolders(parent)];
  } else {
    return [path];
  }
}

/**
 * Check if a path exists, is accessible, and is not a symbolic link
 *
 * @param {*} path
 * @param {*} isDirectory
 */
async function checkPath(path, checkSymLink) {
  let stat;
  try {
    stat = await fs.promises.lstat(path);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw { reason: 'not_found', path };
    } else {
      throw { reason: 'inaccessible', path };
    }
  }

  if (!stat) {
    throw { reason: 'not_found', path };
  }
  if (checkSymLink && stat.isSymbolicLink()) {
    throw { reason: 'symlink', path };
  }
}

/**
 * Load module info from nxs_package.json
 *
 * @param {*} dirPath
 * @returns
 */
async function loadModuleInfo(dirPath) {
  const nxsPackagePath = join(dirPath, 'nxs_package.json');
  if (!fs.existsSync(nxsPackagePath)) {
    throw new Error('nxs_package.json not found');
  }

  let content;
  try {
    const stat = await fs.promises.lstat(nxsPackagePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(nxsPackagePath + ' is not a file');
    }
    content = await fs.promises.readFile(nxsPackagePath);
  } catch (err) {
    throw new Error(`Error reading file at ${nxsPackagePath}: ${err.message}`);
  }

  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error('Invalid JSON at ' + nxsPackagePath);
  }
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
    console.log('nxs_package.json schema errors', validateNxsPackage.errors);
    throw new Error('nxs_package.json validation error: incorrect schema');
  }

  // targetWalletVersion is mandatory for modules in new schema
  if (!moduleInfo.targetWalletVersion && !moduleInfo.specVersion) {
    throw new Error(
      'nxs_package.json validation error: either `targetWalletVersion` or `specVersion` must present in nxs_package.json'
    );
  }

  // Ensure all file paths are relative
  if (moduleInfo.entry && isAbsolute(moduleInfo.entry)) {
    throw new Error(
      'nxs_package.json validation error: `entry` must be a relative path. Getting ' +
        moduleInfo.entry
    );
  }
  if (moduleInfo.icon && isAbsolute(moduleInfo.icon)) {
    throw new Error(
      'nxs_package.json validation error: `icon` must be a relative path. Getting ' +
        moduleInfo.icon
    );
  }
  const nonRelativeFile = moduleInfo.files.find((file) => isAbsolute(file));
  if (nonRelativeFile) {
    throw new Error(
      'nxs_package.json validation error: `files` must contain only relative paths. Getting ' +
        nonRelativeFile
    );
  }

  // Ensure no file names are reserved
  const reservedFile = moduleInfo.files.find((file) =>
    reservedFileNames.includes(normalize(file))
  );
  if (reservedFile) {
    throw new Error(
      `nxs_package.json validation error: ${reservedFile} is a reserved file name`
    );
  }

  // Ensure all files exist and are not directories
  // Also check upper folders of all listed files because folder can be a symlink
  const relativePaths = [].concat(
    ...moduleInfo.files.map((file) => getAllUpperFolders(file))
  );
  const filePaths = relativePaths.map((path) => join(dirPath, path));
  const {
    settings: { devMode, allowSymLink },
  } = store.getState();
  const checkSymLink = !(devMode && allowSymLink);
  try {
    await Promise.all(filePaths.map((path) => checkPath(path, checkSymLink)));
  } catch ({ reason, path }) {
    switch (reason) {
      case 'not_found':
        throw new Error(
          `nxs_package.json validation error: file not found at ${path}`
        );
      case 'inaccessible':
        throw new Error(
          `nxs_package.json validation error: ${path} is inaccessible`
        );
      case 'symlink':
        throw new Error(
          `nxs_package.json validation error: ${path} is a symbolic link`
        );
    }
  }

  // Module type-specific checks
  if (moduleInfo.type === 'app') {
    // Check entry extension corresponding to module type
    if (moduleInfo.entry && !moduleInfo.entry.toLowerCase().endsWith('.html')) {
      throw new Error(
        'nxs_package.json validation error: `entry` file extension must be .html'
      );
    }
  }
}

/**
 * Check if module dev info is valid
 *
 * @param {*} moduleInfo
 * @returns
 */
function validateModuleDevInfo(moduleInfo) {
  if (!validateNxsPackageDev(moduleInfo)) {
    console.log(
      'nxs_package.dev.json schema errors',
      validateNxsPackage.errors
    );
    throw new Error('nxs_package.dev.json validation error: incorrect schema');
  }
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
    (module.repository && module.repoOnline && module.repoVerified)
  );
  module.enabled =
    !module.disallowed && !disabledModules.includes(module.info.name);

  return module;
}

/**
 * =============================================================================
 * Public functions
 * =============================================================================
 */

/**
 * Load a module from a directory
 *
 * @static
 * @param {*} dirPath
 * @returns
 */
export async function loadModuleFromDir(dirPath) {
  const moduleInfo = await loadModuleInfo(dirPath);
  await validateModuleInfo(moduleInfo, dirPath);

  const module = {
    path: dirPath,
    info: moduleInfo,
  };
  module.iconPath = getModuleIconPath(module);
  return await initializeModule(module);
}

/**
 * Load a development module from a directory
 *
 * @static
 * @param {*} dirPath
 * @returns
 */
export async function loadDevModuleFromDir(dirPath) {
  const moduleInfo = await loadModuleDevInfo(dirPath);
  await validateModuleDevInfo(moduleInfo);

  const module = {
    path: dirPath,
    info: moduleInfo,
    development: true,
    enabled: true,
  };
  module.iconPath = getModuleIconPath(module);
  return module;
}

/**
 * Load all installed modules from the app modules directory.
 * Only called once when the wallet is started.
 */
export async function prepareModules() {
  try {
    if (!fs.existsSync(modulesDir)) return {};
    // Call getNexusOrgUsers() to fire up the request as early as possible
    getNexusOrgUsers();
    const { devModulePaths = [] } = store.getState().settings;
    const childNames = await fs.promises.readdir(modulesDir);
    const childPaths = childNames.map((name) => join(modulesDir, name));
    const stats = await Promise.all(
      childPaths.map((path) => fs.promises.stat(path))
    );
    const dirNames = childNames.filter((name, i) => stats[i].isDirectory());
    const dirPaths = dirNames.map((name) => join(modulesDir, name));
    const results = await Promise.allSettled([
      ...devModulePaths.map((path) => loadDevModuleFromDir(path)),
      ...dirPaths.map((path) => loadModuleFromDir(path)),
    ]);
    const moduleList = results
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }) => value);

    const modules = moduleList.reduce((map, module) => {
      if (module) {
        const { name, version } = module.info;
        try {
          if (
            !map[name] ||
            (semver.valid(version) &&
              semver.valid(map[name].version) &&
              semver.gt(version, map[name].version))
          ) {
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

    const failedModules = [];
    for (let i = 0; i < dirNames.length; ++i) {
      const j = devModulePaths.length + i;
      if (results[j].status === 'rejected') {
        failedModules.push({
          name: dirNames[i],
          path: dirPaths[i],
          message: results[j].reason.message,
        });
      }
    }
    if (failedModules.length > 0) {
      store.dispatch({
        type: TYPE.LOAD_MODULES_FAILED,
        payload: failedModules,
      });
    }

    checkForModuleUpdates();
  } catch (err) {
    console.error(err);
    return {};
  }
}
