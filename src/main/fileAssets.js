import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { Reader } from 'maxmind';

import {
  assertExternalUrl,
  assertRelativeModulePath,
  assertSafeModuleName,
  assertString,
} from './ipc/contracts';
import {
  EXTERNAL_ICON_REQUEST_OPTIONS,
  getPublicGeoIpRequestOptions,
  parsePublicGeoIpResponse,
  PUBLIC_GEO_IP_URL,
} from './ipc/networkPolicy';
import { readRegularFileNoFollow } from './ipc/safeCopy';
import { assetsDir } from './paths';
import { resolveModuleRoot } from './moduleFiles';

const locales = new Set([
  'en',
  'ar',
  'de',
  'es',
  'fi',
  'fr',
  'ja',
  'ko',
  'no',
  'nl',
  'pl',
  'pt',
  'ru',
  'sr',
  'zh-cn',
  'ro',
  'hu',
]);

let geoIpReaderPromise;

const MAX_MODULE_ICON_BYTES = 1024 * 1024;

/**
 * Resolve a module-relative asset path under the module root, then read its
 * bytes through a no-follow open. Returning the validated bytes (instead of a
 * later path re-open or file: URL) closes replace-after-realpath TOCTOU.
 */
async function readModuleAssetBytes(moduleName, relativePath, { maxBytes }) {
  const name = assertSafeModuleName(moduleName);
  const assetPath = assertRelativeModulePath(
    assertString(relativePath, 'Module asset path', {
      min: 1,
      max: 1024,
    })
  );
  const { root: moduleRoot, development } = await resolveModuleRoot(name);
  const resolvedPath = path.resolve(moduleRoot, assetPath);
  if (
    resolvedPath !== moduleRoot &&
    !resolvedPath.startsWith(`${moduleRoot}${path.sep}`)
  ) {
    throw new Error('Module asset must be inside its installed module directory');
  }

  const leafStat = await fs.lstat(resolvedPath);
  if (leafStat.isSymbolicLink() || !leafStat.isFile()) {
    throw new Error('Module asset must be a regular non-symlink file');
  }
  if (leafStat.size > maxBytes) {
    throw new Error('Module icon exceeds the maximum allowed size');
  }

  // realpath still matters for intermediate parent-directory symlinks before
  // the no-follow open binds the bytes we return.
  const realRoot = await fs.realpath(moduleRoot);
  const realFile = await fs.realpath(resolvedPath);
  if (realFile !== realRoot && !realFile.startsWith(`${realRoot}${path.sep}`)) {
    throw new Error('Module asset realpath escapes module root');
  }

  return readRegularFileNoFollow(resolvedPath, {
    root: moduleRoot,
    label: 'Module icon',
    maxBytes,
    // Installed module roots live under the app-owned modules directory. On
    // Windows the fd-relative walker is unavailable so the trusted-root path
    // fallback is required after the symlink/realpath checks above.
    // Development roots are mutable user-selected directories and must not use that
    // fallback (same TOCTOU reason directory installs fail closed on Windows).
    allowPathFallback: !development,
  });
}

export async function readModuleIcon(moduleName, relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if (!['.svg', '.png'].includes(extension)) {
    throw new Error('Unsupported module icon type');
  }
  const content = await readModuleAssetBytes(moduleName, relativePath, {
    maxBytes: MAX_MODULE_ICON_BYTES,
  });
  if (extension === '.svg') {
    return { type: 'svg', content: content.toString('utf8') };
  }
  // Return immutable bytes as a data URL so the renderer never re-resolves a
  // mutable module-tree path (file: URLs can race after validation).
  return {
    type: 'url',
    content: `data:image/png;base64,${content.toString('base64')}`,
  };
}

export async function fetchExternalIcon(url) {
  const validatedUrl = assertExternalUrl(url, 'External icon URL');
  const response = await axios.get(
    validatedUrl,
    EXTERNAL_ICON_REQUEST_OPTIONS
  );
  return String(response.data);
}

export async function loadRecoveryWords() {
  const wordlistPath = path.join(assetsDir, 'misc', 'wordlist.txt');
  const contents = await fs.readFile(wordlistPath, 'utf8');
  return contents
    .split(/\r?\n/)
    .map((word) => word.trim())
    .filter(Boolean);
}

async function getGeoIpReader() {
  if (!geoIpReaderPromise) {
    geoIpReaderPromise = fs
      .readFile(path.join(assetsDir, 'GeoLite2-City', 'GeoLite2-City.mmdb'))
      .then((buffer) => new Reader(buffer));
  }
  return geoIpReaderPromise;
}

export async function lookupGeoIp(addresses) {
  if (!Array.isArray(addresses) || addresses.length > 64) {
    throw new Error('Geo IP lookup requires at most 64 addresses');
  }

  const validAddresses = addresses.map((address) =>
    assertString(address, 'IP address', { min: 1, max: 64 })
  );
  const reader = await getGeoIpReader();
  return validAddresses.map((address) => {
    const record = reader.get(address);
    const location = record?.location;
    return location?.latitude !== undefined && location?.longitude !== undefined
      ? {
          address,
          latitude: location.latitude,
          longitude: location.longitude,
          timeZone: location.time_zone || '',
        }
      : null;
  });
}

export async function lookupPublicGeoIp() {
  const response = await fetch(
    PUBLIC_GEO_IP_URL,
    getPublicGeoIpRequestOptions()
  );
  if (!response.ok) {
    throw new Error(`Public Geo IP lookup failed: ${response.status}`);
  }
  return parsePublicGeoIpResponse(await response.json());
}

export function loadTranslationSync(locale) {
  const selectedLocale = assertString(locale, 'Locale', { min: 2, max: 8 });
  if (!locales.has(selectedLocale)) throw new Error('Unsupported locale');
  if (selectedLocale === 'en') return {};
  const csv = fsSync.readFileSync(
    path.join(assetsDir, 'translations', `${selectedLocale}.csv`),
    'utf8'
  );
  const records = parse(csv);
  return records.reduce((dictionary, [key, translation, context]) => {
    const contextKey = context || '';
    if (!dictionary[contextKey]) dictionary[contextKey] = {};
    dictionary[contextKey][key] = translation;
    return dictionary;
  }, {});
}

export async function loadTranslation(locale) {
  return loadTranslationSync(locale);
}
