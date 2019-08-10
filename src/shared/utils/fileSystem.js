import fs from 'fs';
import log from 'electron-log';

export function readJson(path) {
  try {
    const json = fs.readFileSync(path);
    return JSON.parse(json);
  } catch (err) {
    log.warn(`Error reading JSON at ${path} : ${err}`);
    return {};
  }
}

export function writeJson(path, json) {
  return fs.writeFileSync(path, JSON.stringify(json, null, 2));
}
