import fs from 'fs';

export function readJson(path) {
  try {
    const json = fs.readFileSync(path);
    return JSON.parse(json);
  } catch (err) {
    console.error(`Error reading JSON at ${path} : ${err}`);
    return {};
  }
}

export function writeJson(path, json) {
  return fs.writeFileSync(path, JSON.stringify(json, null, 2));
}
