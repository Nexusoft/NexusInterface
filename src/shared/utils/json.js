import fs from 'fs';
import log from 'electron-log';

export function readJson(path) {
  try {
    const json = fs.readFileSync(path);
    return JSON.parse(json);
  } catch (err) {
    log.warn(
      `Cannot read JSON file at ${path}, returning an empty object as fallback`,
      err
    );
    return null;
  }
}

export function writeJson(path, json) {
  return fs.writeFileSync(path, JSON.stringify(json, null, 2));
}

export function tryParsingJson(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    log.warn('Error parsing JSON', json);
    return null;
  }
}
