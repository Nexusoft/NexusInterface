import { join, isAbsolute, normalize } from 'path';
import fs from 'fs';
import Ajv from 'ajv';
import { semverRegex } from 'consts/misc';

import { isModuleDeprecated, isModuleValid } from './utils';
import {
  getRepoInfo,
  isRepoOnline,
  isRepoVerified,
  isAuthorPartOfOrg,
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
  required: ['name', 'displayName', 'version', 'specVersion', 'type', 'files'],
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
    // Module Specifications version that this module was built on
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

function containsSymLink(dirPath) {
  const items = fs.readdirSync(dirPath);
  for (let item of items) {
    const subPath = join(dirPath, item);
    if (fs.lstatSync(subPath).isSymbolicLink()) return true;
    if (fs.statSync(subPath).isDirectory() && containsSymLink(subPath))
      return true;
  }
  return false;
}

/**
 * Check a directory path to see if it is a valid module directory.
 *
 * @export
 * @param {*} dirPath
 * @param {*} { devMode, verifyModuleSource }
 * @returns
 */
export async function loadModuleFromDir(
  dirPath,
  { devMode, verifyModuleSource, allowSymLink }
) {
  try {
    const nxsPackagePath = join(dirPath, 'nxs_package.json');
    if (
      !fs.existsSync(nxsPackagePath) ||
      !fs.statSync(nxsPackagePath).isFile() ||
      fs.lstatSync(nxsPackagePath).isSymbolicLink()
    ) {
      return null;
    }

    const content = await fs.promises.readFile(nxsPackagePath);
    const module = JSON.parse(content);
    if (!validateNxsPackage(module)) return null;

    // Ensure all file paths are relative
    if (module.entry && isAbsolute(module.entry)) return null;
    if (module.icon && isAbsolute(module.icon)) return null;
    if (module.files.some(file => isAbsolute(file))) return null;

    if (module.files.some(file => reservedFileNames.includes(normalize(file))))
      return null;

    // Ensure all files exist and are not directories
    const filePaths = module.files.map(file => join(dirPath, file));
    if (
      filePaths.some(
        filePath =>
          !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()
      )
    ) {
      console.error(
        `Module ${module.name}: Some files listed by the module does not exist`
      );
      return null;
    }

    // Ensure no symbolic links, both files and folders
    // Need to scan the whole folder because symbolic link can link to a directory
    if (!(devMode && allowSymLink) && containsSymLink(dirPath)) {
      console.error(`Module ${module.name} contains some symbolic link!`);
      return null;
    }

    if (module.type === 'app') {
      // Manually check entry extension corresponding to module type
      if (module.entry && !module.entry.endsWith('.html')) {
        return null;
      }
    }

    module.hash = await getModuleHash(dirPath, { module });

    // Check the repository info and verification
    const repoInfo = await getRepoInfo(dirPath);
    if (repoInfo) {
      const [repoOnline, repoVerified, repoFromNexus] = await Promise.all([
        isRepoOnline(repoInfo),
        isRepoVerified(repoInfo, module, dirPath),
        isAuthorPartOfOrg(repoInfo),
      ]);
      Object.assign(module, repoInfo.data, {
        repoOnline,
        repoVerified,
        isFromNexus: repoFromNexus && repoVerified,
      });
    }

    module.deprecated = isModuleDeprecated(module);
    module.invalid = !isModuleValid(module, { devMode, verifyModuleSource });
    return module;
  } catch (err) {
    console.error(err);
    return null;
  }
}
