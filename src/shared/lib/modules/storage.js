import { join } from 'path';
import fs from 'fs';

const storageFileName = 'storage.json';

/**
 *
 *
 * @export
 * @param {*} module
 * @returns
 */
export async function readModuleStorage(module) {
  try {
    const storagePath = join(module.path, storageFileName);
    if ((await fs.promises.stat(storagePath)).isFile()) {
      const content = await fs.promises.readFile(storagePath);
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

  const storagePath = join(module.path, storageFileName);
  return await fs.promises.writeFile(storagePath, content);
}
