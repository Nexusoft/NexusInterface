import { join } from 'path';
import fs from 'fs';
import config from 'api/configuration';

const storageFileName = 'storage.json';
const modulesDir = config.GetModulesDir();

/**
 *
 *
 * @export
 * @param {*} module
 * @returns
 */
export function readModuleStorage(module) {
  try {
    const storagePath = join(modulesDir, module.dirName, storageFileName);
    if (fs.statSync(storagePath).isFile()) {
      const content = fs.readFileSync(storagePath);
      const data = JSON.parse(content);
      return data;
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
  }
  return {};
}

/**
 *
 *
 * @export
 * @param {*} module
 * @param {*} data
 * @returns
 */
export async function writeModuleStorage(module, data) {
  if (!data || typeof data !== 'object') {
    console.error('Module storage data must be an object');
    return;
  }

  let content;
  try {
    content = JSON.stringify(data);
  } catch (err) {
    console.error(err);
    return;
  }
  if (content.length > 1000000) {
    console.error('Module storage data must not exceed 1MB');
    return;
  }

  const storagePath = join(modulesDir, module.dirName, storageFileName);
  return await fs.promises.writeFile(storagePath, content);
}
