import { join, isAbsolute } from 'path';
import { existsSync, promises, statSync, createReadStream } from 'fs';
import crypto from 'crypto';
import Ajv from 'ajv';
import axios from 'axios';
import semver from 'semver';
import semverRegex from 'semver-regex';
import { isText } from 'istextorbinary';
import streamNormalizeEol from 'stream-normalize-eol';
import Multistream from 'multistream';

import config from 'api/configuration';

const modulesDir = config.GetModulesDir();

const ajv = new Ajv();
const nxsPackageSchema = {
  additionalProperties: false,
  required: ['name', 'displayName', 'version', 'apiVersion', 'type', 'files'],
  properties: {
    name: {
      type: 'string',
      // Allows lowercase letters, digits, underscore and dash, but must have at least one lowercase letter
      pattern: '^[0-9a-z_-]*[a-z][0-9a-z_-]*$',
    },
    // A user-friendly name to be displayed on the GUI
    displayName: { type: 'string' },
    version: {
      type: 'string',
      pattern: semverRegex().source,
    },
    // Nexus Module API version that this module was built on
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

// Check if the Module API this module was built on is still supported
const isModuleSupported = module =>
  semver.gte(module.apiVersion, SUPPORTED_MODULE_API_VERSION);

// Check if a module is valid, if not then it must be disabled
const isModuleValid = (module, settings) =>
  isModuleSupported(module) &&
  ((settings.devMode && !settings.verifyModuleSource) ||
    (module.repository && module.repoOnline && module.repoVerified));

/**
 * Repo verification
 * =============================================================================
 */

const repoInfoSchema = {
  additionalProperties: false,
  required: ['data'],
  properties: {
    verification: {
      type: 'object',
      required: ['publicKey', 'signature'],
      properties: {
        publicKey: { type: 'string' },
        signature: { type: 'string' },
      },
    },
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['repository'],
      properties: {
        moduleHash: { type: 'string' },
        repository: {
          type: 'object',
          required: ['type', 'host', 'owner', 'repo', 'commit'],
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
      },
    },
  },
};
const validateRepoInfo = ajv.compile(repoInfoSchema);

async function getRepoInfo(dirPath) {
  const filePath = join(dirPath, 'repo_info.json');
  // Check repo_info.json file exists
  if (!existsSync(filePath)) return null;

  // Check repo_info.json file schema
  try {
    const fileContent = await promises.readFile(filePath);
    const repoInfo = JSON.parse(fileContent);
    if (validateRepoInfo(repoInfo)) {
      return repoInfo;
    }
  } catch (err) {
    return null;
  }

  return null;
}

async function isRepoOnline(repoInfo) {
  const { host, owner, repo, commit } = repoInfo.data.repository;
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

function normalizeFile(path) {
  const stream = createReadStream(path);
  if (isText(path, stream)) {
    const normalizeNewline = streamNormalizeEol('\n');
    return stream.pipe(normalizeNewline);
  } else {
    return stream;
  }
}

async function getModuleHash(module, dirPath) {
  return new Promise((resolve, reject) => {
    try {
      const nxsPackagePath = join(dirPath, 'nxs_package.json');
      const filePaths = module.files.sort().map(file => join(dirPath, file));
      const streams = [
        normalizeFile(nxsPackagePath),
        ...filePaths.map(normalizeFile),
      ];

      const hash = crypto.createHash('sha256');
      hash.setEncoding('base64');
      hash.on('readable', () => {
        resolve(hash.read());
      });
      new Multistream(streams).pipe(hash);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

async function isRepoVerified(repoInfo, module, dirPath) {
  const { data, verification } = repoInfo;

  // Check public key matching
  if (!verification || !data.moduleHash) return false;

  // Check hash of module files matching
  try {
    const hash = await getModuleHash(module, dirPath);
    if (hash !== data.moduleHash) return false;
  } catch (err) {
    return false;
  }

  // Check signature
  const verified = crypto
    .createVerify('RSA-SHA256')
    .update(JSON.stringify(data))
    .end()
    .verify(NEXUS_EMBASSY_PUBLIC_KEY, verification.signature);
  return verified;
}

/**
 * Public API
 * =============================================================================
 */

export async function validateModule(dirPath, settings) {
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

    // Check the repository info and verification
    const repoInfo = await getRepoInfo(dirPath);
    if (repoInfo) {
      const [repoOnline, repoVerified] = await Promise.all([
        isRepoOnline(repoInfo),
        isRepoVerified(repoInfo, module, dirPath),
      ]);
      Object.assign(module, repoInfo.data, { repoOnline, repoVerified });
    }

    module.invalid = !isModuleValid(module, settings);
    return module;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function loadModules(settings) {
  try {
    if (!existsSync(modulesDir)) return {};
    const dirNames = await promises.readdir(modulesDir);
    const dirPaths = dirNames.map(dirName => join(modulesDir, dirName));
    const results = await Promise.all(
      dirPaths.map(path => validateModule(path, settings))
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

    return modules;
  } catch (err) {
    return {};
  }
}

export const isPageModule = module =>
  module.type === 'page' || module.type === 'page-panel';
