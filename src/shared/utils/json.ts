import fs from 'fs';
import log from 'electron-log';

export function readJson(path: string) {
  try {
    const json = fs.readFileSync(path);
    //strip a leading UTF-8 BOM: a file saved with one (an external edit, some editors) would otherwise fail
    //to parse and every setting would silently fall back to its default
    return JSON.parse(json.toString('utf8').replace(/^﻿/, ''));
  } catch (err) {
    log.warn(
      `Cannot read JSON file at ${path}, returning an empty object as fallback`,
      err
    );
    return null;
  }
}

export function writeJson(path: string, json: any) {
  //write to a temp file then rename, so a crash or power loss mid-write cannot leave a half-written or truncated
  //file (which readJson would fail to parse, resetting every setting)
  const tmp = `${path}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(json, null, 2));
  return fs.renameSync(tmp, path);
}

export function tryParsingJson(json: string) {
  try {
    return JSON.parse(json);
  } catch (err) {
    log.warn('Error parsing JSON', json);
    return null;
  }
}
