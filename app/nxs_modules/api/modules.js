import { join, isAbsolute } from 'path';
import { existsSync, promises, statSync, readFileSync } from 'fs';
import crypto from 'crypto';
import Ajv from 'ajv';
import axios from 'axios';
import semver from 'semver';
import semverRegex from 'semver-regex';

import config from 'api/configuration';

const modulesDir = config.GetModulesDir();

const ajv = new Ajv();
const nxsPackageSchema = {
  required: ['name', 'version', 'apiVersion', 'type', 'files'],
  properties: {
    name: {
      type: 'string',
      // Allows lowercase letters, digits, underscore and dash, but must have at least one lowercase letter
      pattern: '^[0-9a-z_-]*[a-z][0-9a-z_-]*$',
    },
    // Name to be displayed to users
    // Fallback to `name` if not specified
    displayName: { type: 'string' },
    version: {
      type: 'string',
      pattern: semverRegex().source,
    },
    // Nexus Module API version that this module was built upon
    apiVersion: {
      type: 'string',
      pattern: semverRegex().source,
    },
    description: { type: 'string' },
    type: { type: 'string', enum: ['page', 'page-panel'] },
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
    repository: {
      type: 'object',
      required: ['type', 'host', 'owner', 'repo'],
      properties: {
        type: { type: 'string', enum: ['git'] },
        // Allowed hosting: github.com
        host: { type: 'string', enum: ['github.com'] },
        owner: { type: 'string' },
        repo: { type: 'string' },
        // Full SHA-1 hash of the git commit this version was built on
        commit: { type: 'string', minLength: 40, maxLength: 40 },
      },
    },
    author: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
    },
    // Lists ALL the files which is used by the module in relative paths from the module directory
    // including `entry` and `icon`
    // excluding `nxs_package.json`, signature file and storage json file
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

async function checkRepo({ host, owner, repo, commit }) {
  if (!host || !owner || !repo || !commit) return false;

  try {
    const apiUrls = {
      'github.com': `https://api.github.com/${owner}/${repo}/commits/${commit}`,
    };
    const url = apiUrls[host];
    const response = await axios.get(url);
    return !!response.data.sha && response.data.sha === commit;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function getIconPath(iconName, dirName) {
  const iconPath = join(modulesDir, dirName, iconName);
  return existsSync(iconPath) ? iconPath : null;
}

function prepareModule(module) {
  // Prepare module icon
  module.iconPath = module.icon
    ? getIconPath(module.icon, module.dirName)
    : getIconPath('icon.svg', module.dirName) ||
      getIconPath('icon.png', module.dirName);

  return module;
}

/**
 * Repo verification
 * =============================================================================
 */

const repoVerificationSchema = {
  required: ['moduleHash', 'publicKey', 'signature'],
  properties: {
    moduleHash: { type: 'string' },
    publicKey: { type: 'string' },
    signature: { type: 'string' },
  },
};
const validateRepoVerification = ajv.compile(repoVerificationSchema);

async function isRepoVerified(module) {
  const verifPath = join(modulesDir, module.dirName, 'repo_verification.json');
  // Check repo_verification.json file exists
  if (!existsSync(verifPath)) return false;

  // Check repo_verification.json file schema
  let verif;
  try {
    const fileContent = await promises.readFile(verifPath);
    verif = JSON.parse(fileContent);
    if (!validateRepoVerification(verif)) return null;
  } catch (err) {
    return false;
  }

  // Check public key matching
  if (verif.publicKey !== NEXUS_EMBASSY_PUBLIC_KEY) return null;

  // Check hash of module files matching
  try {
    const nxsPackagePath = join(dirPath, 'nxs_package.json');
    const nxsPackageContent = await promises.readFile(nxsPackagePath);
    const filePaths = module.files
      .sort()
      .map(file => join(modulesDir, module.dirName, file));
    const hash = filePaths
      .reduce(
        (hash, path) => hash.update(readFileSync(path)),
        crypto.createHash('sha256').update(nxsPackageContent)
      )
      .digest('base64');
    if (hash !== verif.moduleHash) return false;
  } catch (err) {
    return false;
  }

  // Check signature validity
  const verifier = crypto
    .createVerify('RSA-SHA256')
    .update(verif)
    .end();
  return verifier.verify(NEXUS_EMBASSY_PUBLIC_KEY, verif.publicKey);
}

/**
 * Public API
 * =============================================================================
 */

export async function validateModule(dirPath) {
  try {
    const nxsPackagePath = join(dirPath, 'nxs_package.json');
    if (!existsSync(nxsPackagePath) || !statSync(nxsPackagePath).isFile) {
      return null;
    }

    const content = await promises.readFile(nxsPackagePath);
    const module = JSON.parse(content);
    if (!validateNxsPackage(module)) return null;

    // Ensure all file paths are relative
    if (module.entry && isAbsolute(module.entry)) return null;
    if (module.icon && isAbsolute(module.icon)) return null;
    if (module.files.some(file => isAbsolute(file))) return null;

    if (isPageModule(module)) {
      // Manually check entry extension corresponding to module type
      if (module.entry && !module.entry.endsWith('.html')) {
        return null;
      }
    }

    module.validation = {
      // Check if the Module API this module was built upon is still supported
      apiVersionSupported: semver.gte(
        module.apiVersion,
        SUPPORTED_MODULE_API_VERSION
      ),
      // Check if the repository exists and is public
      repoFound: !!module.repository && (await checkRepo(module.repository)),
    };

    if (module.validation.repoFound) {
      module.validation.repoVerified = await isRepoVerified(module);
    }

    return module;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function loadModules() {
  try {
    if (!existsSync(modulesDir)) return {};
    const dirNames = await promises.readdir(modulesDir);
    const dirPaths = dirNames.map(dirName => join(modulesDir, dirName));
    const results = await Promise.all(dirPaths.map(validateModule));

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

    return modules;
  } catch (err) {
    return {};
  }
}

export const isModuleValid = (module, state) =>
  module.validation.apiVersionSupported &&
  (module.validation.repoFound ||
    (state.settings.devMode && state.settings.allowedModules === 'all'));

export const isPageModule = module =>
  module.type === 'page' || module.type === 'page-panel';
