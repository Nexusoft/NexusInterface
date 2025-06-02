import fs from 'fs';
import { dirname } from 'path';

/**
 * Node.js `mkdir`'s `recursive` option doesn't work somehow (last tested on node.js v10.11.0)
 * So we need to write it manually
 *
 * @param {string} path
 */
export default async function ensureDirExists(path: string) {
  if (!fs.existsSync(path)) {
    const parent = dirname(path);
    await ensureDirExists(parent);
    await fs.promises.mkdir(path);
  }
}
