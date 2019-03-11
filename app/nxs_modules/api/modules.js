import { join } from 'path';
import { existsSync, promises, statSync } from 'fs';
import Ajv from 'ajv';
import axios from 'axios';
import semver from 'semver';
import semverRegex from 'semver-regex';

import config from 'api/configuration';

const ajv = new Ajv();
const nxsPackageSchema = {
  required: ['name', 'version', 'apiVersion', 'type'],
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
    type: { type: 'string', enum: ['page'] },
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
  },
};
const validateSchema = ajv.compile(nxsPackageSchema);

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
    if (!validateSchema(module)) return null;

    // Manually check entry extension corresponding to module type
    if (module.entry) {
      if (module.type === 'page' && !module.entry.endsWidth('.html')) {
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

    // TODO: Check directory tree hash & signature

    return module;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function loadModules() {
  try {
    const modulesDir = config.GetModulesDir();
    if (!existsSync(modulesDir)) return {};
    const dirNames = await promises.readdir(modulesDir);
    const dirPaths = dirNames.map(dirName => join(modulesDir, dirName));
    const results = await Promise.all(dirPaths.map(validateModule));

    const modules = results.reduce((map, result, i) => {
      if (result) {
        const module = { ...result, dirName };
        // If 2 modules have the same name, keep the one with the higher version
        if (
          !map[module.name] ||
          semver.gt(module.version, map[module.name].version)
        ) {
          map[module.name] = module;
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
