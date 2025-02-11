import fs from 'fs';
import { join } from 'path';
import { Module } from './module';

const storageFileName = 'storage.json';

export async function readModuleStorage(module: Module) {
  try {
    const storagePath = join(module.path, storageFileName);
    if ((await fs.promises.stat(storagePath)).isFile()) {
      const content = await fs.promises.readFile(storagePath);
      const data = JSON.parse(String(content));
      return data;
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
  }
  return {};
}

export async function writeModuleStorage(module: Module, data: any) {
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
