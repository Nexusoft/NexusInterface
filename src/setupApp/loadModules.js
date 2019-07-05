import { join } from 'path';
import { existsSync, promises, statSync } from 'fs';
import Ajv from 'ajv';
import semverRegex from 'semver-regex';
import config from 'api/configuration';

export const loadModules = async () => dispatch => {
  const modulesDir = join(config.GetAppDataDirectory(), 'modules');
  if (!existsSync(modulesDir)) return;

  const subItems = await promises.readdir(modulesDir);

  const ajv = new Ajv();
  const nxsPackageSchema = {
    required: ['name', 'version', 'repository'],
    properties: {
      name: {
        type: 'string',
        // allows lowercase letters, digits, underscore and dash, but must have at least one lowercase letter
        pattern: '^[0-9a-z_-]*[a-z][0-9a-z_-]*$',
      },
      // Name to be displayed to users, fallback to `name` if not present
      displayName: { type: 'string' },
      version: {
        type: 'string',
        pattern: semverRegex().source,
      },
      description: { type: 'string' },
      author: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
      // Relative path to the main js file
      main: { type: 'string' },
      repository: {
        type: 'object',
        required: ['type', 'url'],
        properties: {
          type: { type: 'string', enum: ['git'] },
          url: { type: 'string' },
        },
      },
    },
  };
  const validateSchema = ajv.compile(nxsPackageSchema);
  async function loadModuleFromDir(dirName) {
    try {
      const dirPath = join(modulesDir, dirName);
      const nxsPackagePath = join(dirPath, 'nxs_package.json');
      if (!existsSync(nxsPackagePath) || !statSync(nxsPackagePath).isFile) {
        return null;
      }

      const content = await promises.readFile(nxsPackagePath);
      const module = JSON.parse(content);
      if (!validateSchema(module)) return null;

      return [dirName, module];
    } catch (err) { 
      console.error(err);
      return null;
    }
  }

  const modules = await Promise.all(subItems.map(loadModuleFromDir));
  const modulesMap = modules
    .filter(m => m)
    .reduce((map, [dirName, module]) => {
      map[dirName] = module;
    }, {});

  
}
