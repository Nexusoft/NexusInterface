import fs from 'fs';
import { dirname, isAbsolute, join, normalize } from 'path';
import semver from 'semver';
import z from 'zod';

import { semverRegex } from 'consts/misc';
import { modulesDir } from 'consts/paths';
import { settingsAtom } from 'lib/settings';
import { store } from 'lib/store';

import { failedModulesAtom, modulesMapAtom } from './atoms';
import { CachedRelease, checkForModuleUpdates } from './autoUpdate';
import {
  getModuleHash,
  getNexusOrgUsers,
  isModuleVerified,
  isRepoFromNexus,
  isRepoOnline,
  loadRepoInfo,
  Repository,
} from './repo';

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
const nxsPackageSchema = z.object({
  // Allows lowercase letters, digits, underscore and dash, but must have at least one lowercase letter
  name: z.string().regex(/^[0-9a-z_-]*[a-z][0-9a-z_-]*$/),
  // A user-friendly name to be displayed on the GUI
  displayName: z.string().regex(/^[^\n]*$/),
  version: z.string().regex(semverRegex),
  // Wallet version that this module was built for and tested on
  targetWalletVersion: z.string().regex(semverRegex).optional(),
  // DEPRECATED! This is added so that old modules is recognized
  specVersion: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['app']),
  options: z
    .object({
      wrapInPanel: z.boolean().optional(),
    })
    .optional(),
  // Relative path to the entry file.
  // Main file could be html or js depending on module's type.
  // If not specified, app will look for index.html or index.js depending on module type.
  entry: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+$|^$/)
    .optional(),
  // Relative path to the icon file.
  // Currently svg and png formats are supported.
  // If not specified, app will look for icon.svg and icon.png.
  // Checks for file extension, allows empty strings, disallows ../ and ..\
  icon: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+\.(svg|png)$|^$/)
    .optional(),
  author: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  // Lists ALL the files which is used by the module in relative paths from the module directory.
  // including files specified in `entry` and `icon` fields.
  // excluding `nxs_package.json`, `repo_info.json` and `storage.json`.
  // Disallows ../ and ..\
  files: z.array(z.string().regex(/^(.(?<!\.\.\/|\.\.\\))+$/)),
});

/**
 * =============================================================================
 * nxs_package.dev.json schema
 * =============================================================================
 */
const nxsPackageDevSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  type: z.enum(['app']),
  entry: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+$|^$/)
    .optional(),
  icon: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+\.(svg|png)$|^$/)
    .optional(),
  options: z
    .object({
      wrapInPanel: z.boolean().optional(),
    })
    .optional(),
});

/**
 * =============================================================================
 * Private functions
 * =============================================================================
 */

/**
 * Get a list of upper folders of a path including that path
 */
function getAllUpperFolders(path: string): string[] {
  const parent = dirname(path);
  if (parent !== '.' && parent !== '/' && parent !== path) {
    return [path, ...getAllUpperFolders(parent)];
  } else {
    return [path];
  }
}

/**
 * Check if a path exists, is accessible, and is not a symbolic link
 */
async function checkPath(path: string, checkSymLink?: boolean) {
  let stat;
  try {
    stat = await fs.promises.lstat(path);
  } catch (err: any) {
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
 */
async function loadModuleInfo(dirPath: string) {
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
  } catch (err: any) {
    throw new Error(`Error reading file at ${nxsPackagePath}: ${err.message}`);
  }

  try {
    return content ? JSON.parse(String(content)) : undefined;
  } catch (err) {
    throw new Error('Invalid JSON at ' + nxsPackagePath);
  }
}

/**
 * Load module dev info from nxs_package.dev.json
 */
async function loadModuleDevInfo(dirPath: string) {
  const nxsPackageDevPath = join(dirPath, 'nxs_package.dev.json');
  const content = await fs.promises.readFile(nxsPackageDevPath);
  return content ? JSON.parse(String(content)) : undefined;
}

/**
 * Check if module info is valid
 */
async function parseModuleInfo(moduleInfo: any, dirPath: string) {
  let parsed: ModuleInfo | null = null;
  try {
    parsed = nxsPackageSchema.parse(moduleInfo);
  } catch (err: any) {
    console.log('nxs_package.json schema errors', err);
    throw new Error('Invalid nxs_package.json');
  }

  // targetWalletVersion is mandatory for modules in new schema
  if (!parsed.targetWalletVersion && !parsed.specVersion) {
    throw new Error(
      'nxs_package.json validation error: either `targetWalletVersion` or `specVersion` must present in nxs_package.json'
    );
  }

  // Ensure all file paths are relative
  if (parsed.entry && isAbsolute(parsed.entry)) {
    throw new Error(
      'nxs_package.json validation error: `entry` must be a relative path. Getting ' +
        parsed.entry
    );
  }
  if (parsed.icon && isAbsolute(parsed.icon)) {
    throw new Error(
      'nxs_package.json validation error: `icon` must be a relative path. Getting ' +
        parsed.icon
    );
  }
  const nonRelativeFile = parsed.files.find((file) => isAbsolute(file));
  if (nonRelativeFile) {
    throw new Error(
      'nxs_package.json validation error: `files` must contain only relative paths. Getting ' +
        nonRelativeFile
    );
  }

  // Ensure no file names are reserved
  const reservedFile = parsed.files.find((file) =>
    reservedFileNames.includes(normalize(file))
  );
  if (reservedFile) {
    throw new Error(
      `nxs_package.json validation error: ${reservedFile} is a reserved file name`
    );
  }

  // Ensure all files exist and are not directories
  // Also check upper folders of all listed files because folder can be a symlink
  const relativePaths = parsed.files.flatMap(getAllUpperFolders);
  const filePaths = relativePaths.map((path) => join(dirPath, path));
  const { devMode, allowSymLink } = store.get(settingsAtom);
  const checkSymLink = !(devMode && allowSymLink);
  try {
    await Promise.all(filePaths.map((path) => checkPath(path, checkSymLink)));
  } catch (err: any) {
    switch (err?.reason) {
      case 'not_found':
        throw new Error(
          `nxs_package.json validation error: file not found at ${err?.path}`
        );
      case 'inaccessible':
        throw new Error(
          `nxs_package.json validation error: ${err?.path} is inaccessible`
        );
      case 'symlink':
        throw new Error(
          `nxs_package.json validation error: ${err?.path} is a symbolic link`
        );
      default:
        throw new Error('nxs_package.json validation error');
    }
  }

  // Module type-specific checks
  if (parsed.type === 'app') {
    // Check entry extension corresponding to module type
    if (parsed.entry && !parsed.entry.toLowerCase().endsWith('.html')) {
      throw new Error(
        'nxs_package.json validation error: `entry` file extension must be .html'
      );
    }
  }

  return parsed;
}

/**
 * Check if module dev info is valid
 */
function parseModuleDevInfo(moduleInfo: any): DevModuleInfo {
  try {
    return nxsPackageDevSchema.parse(moduleInfo);
  } catch (err: any) {
    console.log('nxs_package.dev.json schema errors', err);
    throw new Error('Invalid nxs_package.dev.json');
  }
}

/**
 * Get the path of an icon if the file does exist
 */
function getIconPathIfExists(iconName: string, dirPath: string) {
  const iconPath = join(dirPath, iconName);
  return fs.existsSync(iconPath) ? iconPath : undefined;
}

/**
 * Find the icon path for a module
 */
function getModuleIconPath(iconName: string | undefined, dirPath: string) {
  return iconName
    ? getIconPathIfExists(iconName, dirPath)
    : getIconPathIfExists('icon.svg', dirPath) ||
        getIconPathIfExists('icon.png', dirPath);
}

/**
 * Fill extra info about the module
 */
async function initializeModule(moduleInfo: ModuleInfo, dirPath: string) {
  // Check the repository info and verification
  const hash = await getModuleHash(moduleInfo, dirPath);
  const repoInfo = await loadRepoInfo(dirPath);
  const repository = repoInfo?.data.repository;
  const [repoOnline, repoVerified, repoFromNexus] = await Promise.all([
    isRepoOnline(repository),
    isModuleVerified(hash, repoInfo),
    isRepoFromNexus(repository),
  ]);

  const { devMode, verifyModuleSource, disabledModules } =
    store.get(settingsAtom);
  const incompatible =
    !moduleInfo.targetWalletVersion ||
    semver.lt(moduleInfo.targetWalletVersion, BACKWARD_COMPATIBLE_VERSION);
  const disallowed = !(
    (devMode && !verifyModuleSource) ||
    (repository && repoOnline && repoVerified)
  );
  const enabled = !disallowed && !disabledModules.includes(moduleInfo.name);

  return {
    hash,
    repository,
    repoOnline,
    repoVerified,
    repoFromNexus,
    incompatible,
    disallowed,
    enabled,
  } as ModuleInitialization;
}

/**
 * =============================================================================
 * Type definitions
 * =============================================================================
 */

export type ModuleInfo = z.infer<typeof nxsPackageSchema>;

export type DevModuleInfo = z.infer<typeof nxsPackageDevSchema>;

interface ModuleBase {
  path: string;
  info: ModuleInfo | DevModuleInfo;
  iconPath?: string;
}

interface ModuleInitialization {
  hash: string;
  repository?: Repository;
  incompatible: boolean;
  disallowed: boolean;
  repoOnline: boolean;
  repoVerified: boolean;
  repoFromNexus: boolean;
  enabled: boolean;
}

export interface ProductionModule extends ModuleBase, ModuleInitialization {
  development?: false;
  info: ModuleInfo;
  hasNewVersion?: boolean;
  latestVersion?: string;
  latestRelease?: CachedRelease;
}

export interface DevModule extends ModuleBase {
  development: true;
  info: DevModuleInfo;
  enabled: boolean;
}

export type Module = ProductionModule | DevModule;

export interface FailedModule {
  name: string;
  path: string;
  message: string;
}

/**
 * =============================================================================
 * Public functions
 * =============================================================================
 */

export function isDevModule(module: Module): module is DevModule {
  return !!module.development;
}

/**
 * Load a module from a directory
 */
export async function loadModuleFromDir(dirPath: string) {
  const rawModuleInfo = await loadModuleInfo(dirPath);
  const moduleInfo = await parseModuleInfo(rawModuleInfo, dirPath);
  const iconPath = getModuleIconPath(moduleInfo.icon, dirPath);

  const initialization = await initializeModule(moduleInfo, dirPath);
  return {
    path: dirPath,
    info: moduleInfo,
    iconPath,
    ...initialization,
  } as ProductionModule;
}

/**
 * Load a development module from a directory
 */
export async function loadDevModuleFromDir(dirPath: string) {
  const rawModuleInfo = await loadModuleDevInfo(dirPath);
  const moduleInfo = parseModuleDevInfo(rawModuleInfo);
  const iconPath = getModuleIconPath(undefined, dirPath);
  const module: DevModule = {
    development: true,
    path: dirPath,
    info: moduleInfo,
    iconPath,
    enabled: true,
  };
  return module;
}

/**
 * Load all installed modules from the app modules directory.
 * Only called once when the wallet is started.
 */
export async function prepareModules() {
  try {
    if (!fs.existsSync(modulesDir)) return;
    // Call getNexusOrgUsers() to fire up the request as early as possible
    getNexusOrgUsers();
    const { devModulePaths = [] } = store.get(settingsAtom);
    const childNames = await fs.promises.readdir(modulesDir);
    const childPaths = childNames.map((name) => join(modulesDir, name));
    const stats = await Promise.all(
      childPaths.map((path) => fs.promises.stat(path))
    );
    const dirNames = childNames.filter((_name, i) => stats[i].isDirectory());
    const dirPaths = dirNames.map((name) => join(modulesDir, name));
    const results = await Promise.allSettled([
      ...devModulePaths.map((path) => loadDevModuleFromDir(path)),
      ...dirPaths.map((path) => loadModuleFromDir(path)),
    ]);
    const moduleList = results
      .filter(({ status }) => status === 'fulfilled')
      .map(({ value }: any) => value);

    const modulesMap = moduleList.reduce((map, module) => {
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
    store.set(modulesMapAtom, modulesMap);

    const failedModules: FailedModule[] = [];
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
      store.set(failedModulesAtom, failedModules);
    }

    checkForModuleUpdates();
  } catch (err) {
    console.error(err);
  }
}
