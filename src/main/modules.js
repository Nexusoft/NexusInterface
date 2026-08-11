import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';
import https from 'https';
import {
  dirname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
  sep,
} from 'path';

import { shell } from 'electron';

import axios from 'axios';
import { isText } from 'istextorbinary';
import Multistream from 'multistream';
import semver from 'semver';
import z from 'zod';

import normalizeEol from './normalizeEol';
import { fetchGithubLatestRelease, getMembers, getRepoId } from 'lib/github';

import {
  EVENTS,
  assertRecord,
  assertSafeModuleName,
  assertString,
} from './ipc/contracts';
import {
  cleanupInternalModuleDirectories,
  installModuleDirectory,
  listPublicModuleDirectoryNames,
  supportsFdRelativeOpen,
} from './ipc/safeCopy';
import { extractSafeZip } from './ipc/safeZip';
import { modulesDir, moduleDownloadDir, temporaryModuleDir } from './paths';
import { loadSettingsFromFile } from './settings';
import { resolveModuleRoot } from './moduleFiles';

/**
 * This module is the main-process module registry: it owns every filesystem,
 * network, and crypto operation involved in discovering, installing,
 * updating, and removing app modules. The renderer only ever sees the
 * serializable results below through the `modules:*` IPC operations; it no
 * longer touches `fs`/`https`/`crypto` directly.
 */

// Duplicated from `consts/misc.ts` (semver-regex) because that file executes
// browser-only code (`document`, `window`) at import time and cannot safely
// be imported into the main process.
const SEMVER_REGEX =
  /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/gi;

const RESERVED_MODULE_FILE_NAMES = [
  'nxs_package.json',
  'nxs_package.dev.json',
  'repo_info.json',
  'storage.json',
];

const SUPPORTED_ARCHIVE_EXTENSIONS = ['.zip'];
const MAX_MODULE_ARCHIVE_BYTES = 100 * 1024 * 1024;
const MAX_MODULE_ARCHIVE_ENTRIES = 10000;
const MAX_MODULE_ARCHIVE_ENTRY_BYTES = 100 * 1024 * 1024;
const MAX_MODULE_ARCHIVE_EXPANDED_BYTES = 250 * 1024 * 1024;
const MAX_MODULE_ARCHIVE_COMPRESSION_RATIO = 100;
const MODULE_ARCHIVE_LIMITS = Object.freeze({
  maxCompressionRatio: MAX_MODULE_ARCHIVE_COMPRESSION_RATIO,
  maxEntries: MAX_MODULE_ARCHIVE_ENTRIES,
  maxEntryBytes: MAX_MODULE_ARCHIVE_ENTRY_BYTES,
  maxExpandedBytes: MAX_MODULE_ARCHIVE_EXPANDED_BYTES,
});

/**
 * =============================================================================
 * nxs_package.json / nxs_package.dev.json / repo_info.json schemas
 * =============================================================================
 */
const nxsPackageSchema = z.object({
  name: z.string().regex(/^[0-9a-z_-]*[a-z][0-9a-z_-]*$/),
  displayName: z.string().regex(/^[^\n]*$/),
  version: z.string().regex(SEMVER_REGEX),
  targetWalletVersion: z.string().regex(SEMVER_REGEX).optional(),
  specVersion: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['app']),
  options: z
    .object({
      wrapInPanel: z.boolean().optional(),
    })
    .optional(),
  entry: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+$|^$/)
    .optional(),
  icon: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+\.(svg|png)$|^$/)
    .optional(),
  author: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  files: z.array(z.string().regex(/^(.(?<!\.\.\/|\.\.\\))+$/)),
});

const nxsPackageDevSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  type: z.enum(['app']),
  entry: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+$|^$/)
    .optional(),
  icon: z
    .string()
    .regex(/^(.(?<!\.\.\/|\.\.\\))+\.(svg|png)$|^$/)
    .optional(),
  options: z
    .object({
      wrapInPanel: z.boolean().optional(),
    })
    .optional(),
});

const repositorySchema = z.object({
  type: z.enum(['git']),
  host: z.enum(['github.com']),
  owner: z.string(),
  repo: z.string(),
  commit: z.string().min(40).max(40),
});

const repoInfoSchema = z.object({
  verification: z
    .object({
      signature: z.string(),
    })
    .optional(),
  data: z.object({
    repository: repositorySchema,
    moduleHash: z.string().optional(),
  }),
});

/**
 * =============================================================================
 * Filesystem helpers
 * =============================================================================
 */

function getAllUpperFolders(path) {
  const parent = dirname(path);
  if (parent !== '.' && parent !== '/' && parent !== path) {
    return [path, ...getAllUpperFolders(parent)];
  }
  return [path];
}

async function checkPath(path, checkSymLink) {
  let stat;
  try {
    stat = await fsp.lstat(path);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw { reason: 'not_found', path };
    } else {
      throw { reason: 'inaccessible', path };
    }
  }
  if (!stat) throw { reason: 'not_found', path };
  if (checkSymLink && stat.isSymbolicLink()) throw { reason: 'symlink', path };
}

async function loadModuleInfoFile(dirPath) {
  const nxsPackagePath = join(dirPath, 'nxs_package.json');
  if (!fs.existsSync(nxsPackagePath)) {
    throw new Error('nxs_package.json not found');
  }
  let content;
  try {
    const stat = await fsp.lstat(nxsPackagePath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(nxsPackagePath + ' is not a file');
    }
    content = await fsp.readFile(nxsPackagePath);
  } catch (err) {
    throw new Error(`Error reading file at ${nxsPackagePath}: ${err.message}`);
  }
  try {
    return content ? JSON.parse(String(content)) : undefined;
  } catch {
    throw new Error('Invalid JSON at ' + nxsPackagePath);
  }
}

async function loadModuleDevInfoFile(dirPath) {
  const nxsPackageDevPath = join(dirPath, 'nxs_package.dev.json');
  const content = await fsp.readFile(nxsPackageDevPath);
  return content ? JSON.parse(String(content)) : undefined;
}

async function parseModuleInfo(moduleInfo, dirPath, settings) {
  let parsed;
  try {
    parsed = nxsPackageSchema.parse(moduleInfo);
  } catch (err) {
    console.log('nxs_package.json schema errors', err);
    throw new Error('Invalid nxs_package.json');
  }

  if (!parsed.targetWalletVersion && !parsed.specVersion) {
    throw new Error(
      'nxs_package.json validation error: either `targetWalletVersion` or `specVersion` must present in nxs_package.json'
    );
  }
  if (parsed.entry && isAbsolute(parsed.entry)) {
    throw new Error(
      'nxs_package.json validation error: `entry` must be a relative path. Getting ' +
        parsed.entry
    );
  }
  if (parsed.icon && isAbsolute(parsed.icon)) {
    throw new Error(
      'nxs_package.json validation error: `icon` must be a relative path. Getting ' +
        parsed.icon
    );
  }
  const nonRelativeFile = parsed.files.find((file) => isAbsolute(file));
  if (nonRelativeFile) {
    throw new Error(
      'nxs_package.json validation error: `files` must contain only relative paths. Getting ' +
        nonRelativeFile
    );
  }
  const reservedFile = parsed.files.find((file) =>
    RESERVED_MODULE_FILE_NAMES.includes(normalize(file))
  );
  if (reservedFile) {
    throw new Error(
      `nxs_package.json validation error: ${reservedFile} is a reserved file name`
    );
  }

  const relativePaths = parsed.files.flatMap(getAllUpperFolders);
  const filePaths = relativePaths.map((path) => join(dirPath, path));
  const { devMode, allowSymLink } = settings;
  const checkSymLink = !(devMode && allowSymLink);
  try {
    await Promise.all(filePaths.map((path) => checkPath(path, checkSymLink)));
  } catch (err) {
    switch (err?.reason) {
      case 'not_found':
        throw new Error(
          `nxs_package.json validation error: file not found at ${err?.path}`
        );
      case 'inaccessible':
        throw new Error(
          `nxs_package.json validation error: ${err?.path} is inaccessible`
        );
      case 'symlink':
        throw new Error(
          `nxs_package.json validation error: ${err?.path} is a symbolic link`
        );
      default:
        throw new Error('nxs_package.json validation error');
    }
  }

  if (parsed.type === 'app') {
    if (parsed.entry && !parsed.entry.toLowerCase().endsWith('.html')) {
      throw new Error(
        'nxs_package.json validation error: `entry` file extension must be .html'
      );
    }
  }

  return parsed;
}

function parseModuleDevInfo(moduleInfo) {
  try {
    return nxsPackageDevSchema.parse(moduleInfo);
  } catch (err) {
    console.log('nxs_package.dev.json schema errors', err);
    throw new Error('Invalid nxs_package.dev.json');
  }
}

/**
 * =============================================================================
 * Module hash & repository verification (ported from lib/modules/repo.ts)
 * =============================================================================
 */

function normalizeFile(path) {
  const stream = fs.createReadStream(path);
  const buffer = fs.readFileSync(path);
  if (isText(path, buffer)) {
    return stream.pipe(normalizeEol('\n'));
  }
  return stream;
}

function getModuleHash(moduleInfo, dirPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const nxsPackagePath = join(dirPath, 'nxs_package.json');
      const filePaths = moduleInfo.files
        .slice()
        .sort()
        .map((file) => join(dirPath, file));
      const streams = [
        normalizeFile(nxsPackagePath),
        ...filePaths.map(normalizeFile),
      ];
      const hash = crypto.createHash('sha256');
      hash.setEncoding('base64');
      hash.on('readable', () => {
        const result = hash.read();
        resolve(result ? String(result) : undefined);
      });
      new Multistream(streams).pipe(hash);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

async function loadRepoInfo(dirPath) {
  const filePath = join(dirPath, 'repo_info.json');
  if (!fs.existsSync(filePath)) return undefined;
  const lstat = await fsp.lstat(filePath);
  if (lstat.isSymbolicLink()) return undefined;
  try {
    const fileContent = await fsp.readFile(filePath);
    const rawRepoInfo = JSON.parse(String(fileContent));
    return repoInfoSchema.parse(rawRepoInfo);
  } catch (err) {
    console.error(err);
  }
  return undefined;
}

async function isRepoOnline(repository) {
  if (!repository) return false;
  const { host, owner, repo, commit } = repository;
  if (!host || !owner || !repo || !commit) return false;
  try {
    const apiUrls = {
      'github.com': `https://github.com/${owner}/${repo}/commit/${commit}`,
    };
    const url = apiUrls[host];
    const requestHead = (url) =>
      new Promise((resolve, reject) => {
        try {
          https
            .request(url, { method: 'HEAD' }, (res) => resolve(res))
            .on('error', (err) => reject(err))
            .end();
        } catch (error) {
          reject(error);
        }
      });
    const res = await requestHead(url);
    return res.statusCode === 200;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function isModuleVerified(moduleHash, repoInfo) {
  if (!repoInfo) return false;
  const { data, verification } = repoInfo;
  if (!verification || !data || !data.moduleHash) return false;
  try {
    if (data.moduleHash !== moduleHash) return false;
    const serializedData = JSON.stringify(data);
    return crypto
      .createVerify('RSA-SHA256')
      .update(serializedData, 'utf8')
      .end()
      .verify(
        { key: NEXUS_EMBASSY_PUBLIC_KEY, format: 'pem' },
        verification.signature,
        'base64'
      );
  } catch (err) {
    console.error(err);
    return false;
  }
}

const getNexusOrgUsers = (() => {
  let nexusOrgUsers;
  let promise = null;
  return () => {
    if (!promise) {
      promise = new Promise(async (resolve, reject) => {
        if (!nexusOrgUsers) {
          try {
            const response = await getMembers('Nexusoft');
            nexusOrgUsers = response.data.map((e) => e.login);
          } catch (err) {
            console.error(err);
            return reject(err);
          } finally {
            promise = null;
          }
        }
        resolve(nexusOrgUsers);
      });
    }
    return promise;
  };
})();

async function isRepoFromNexus(repository) {
  if (!repository) return false;
  const { host, owner, repo, commit } = repository;
  if (!host || !owner || !repo || !commit) return false;
  if (owner === 'Nexusoft') return true;
  const nexusOrgUsers = await getNexusOrgUsers();
  if (!nexusOrgUsers) return false;
  return nexusOrgUsers.includes(owner);
}

async function initializeModule(moduleInfo, dirPath, settings) {
  const hash = await getModuleHash(moduleInfo, dirPath);
  const repoInfo = await loadRepoInfo(dirPath);
  const repository = repoInfo?.data.repository;
  const [repoOnline, repoVerified, repoFromNexus] = await Promise.all([
    isRepoOnline(repository),
    isModuleVerified(hash, repoInfo),
    isRepoFromNexus(repository),
  ]);

  const { devMode, verifyModuleSource, disabledModules } = settings;
  const incompatible =
    !moduleInfo.targetWalletVersion ||
    semver.lt(moduleInfo.targetWalletVersion, BACKWARD_COMPATIBLE_VERSION);
  const disallowed = !(
    (devMode && !verifyModuleSource) ||
    (repository && repoOnline && repoVerified)
  );
  const enabled = !disallowed && !disabledModules.includes(moduleInfo.name);

  return {
    hash,
    repository,
    repoOnline,
    repoVerified,
    repoFromNexus,
    incompatible,
    disallowed,
    enabled,
  };
}

/**
 * Load a production module from an installed directory. Returns a plain,
 * JSON-serializable object (no filesystem paths) suitable to send to the
 * renderer.
 */
async function loadModuleFromDir(dirPath, settings) {
  const rawModuleInfo = await loadModuleInfoFile(dirPath);
  const moduleInfo = await parseModuleInfo(rawModuleInfo, dirPath, settings);
  const initialization = await initializeModule(moduleInfo, dirPath, settings);
  return {
    development: false,
    info: moduleInfo,
    ...initialization,
  };
}

/**
 * Load a development module. `path` is retained on the result because the
 * renderer needs it only to match against the `devModulePaths` setting
 * entries it already owns (no filesystem access is implied).
 */
async function loadDevModuleFromDir(dirPath) {
  const rawModuleInfo = await loadModuleDevInfoFile(dirPath);
  const moduleInfo = parseModuleDevInfo(rawModuleInfo);
  return {
    development: true,
    path: dirPath,
    info: moduleInfo,
    enabled: true,
  };
}

// Keyed by the on-disk directory name so `openFailureLocation` never has to
// trust a path supplied by the renderer.
let failedModulePaths = new Map();

/**
 * List every installed and development module, mirroring the previous
 * renderer-side `prepareModules()` inventory scan.
 */
export async function listModules() {
  const settings = loadSettingsFromFile();
  const { devModulePaths = [] } = settings;

  // Fire the request as early as possible, same as the previous renderer flow.
  getNexusOrgUsers();

  const dirNames = await listPublicModuleDirectoryNames(modulesDir, {
    log: (message) => console.warn(message),
  });
  const dirPaths = dirNames.map((name) => join(modulesDir, name));

  const results = await Promise.allSettled([
    ...devModulePaths.map((path) => loadDevModuleFromDir(path)),
    ...dirPaths.map((path) => loadModuleFromDir(path, settings)),
  ]);

  const modules = results
    .filter(({ status }) => status === 'fulfilled')
    .map(({ value }) => value);

  const newFailedModulePaths = new Map();
  const failedModules = [];
  for (let i = 0; i < dirNames.length; ++i) {
    const j = devModulePaths.length + i;
    if (results[j].status === 'rejected') {
      failedModules.push({ name: dirNames[i], message: results[j].reason?.message });
      newFailedModulePaths.set(dirNames[i], dirPaths[i]);
    }
  }
  failedModulePaths = newFailedModulePaths;

  return { modules, failedModules };
}

/**
 * Open the folder of a module that failed to load. Only ever opens a path
 * that this process itself discovered during the last `listModules()` scan,
 * never a path supplied directly by the renderer.
 */
export async function openFailureLocation(name) {
  const key = assertSafeishFolderName(name);
  const path = failedModulePaths.get(key);
  if (!path) throw new Error('Unknown failed module');
  return shell.openPath(path);
}

function assertSafeishFolderName(value) {
  const name = assertString(value, 'Module folder name', { min: 1, max: 255 });
  if (name.includes('\0') || name === '.' || name === '..') {
    throw new TypeError('Module folder name is invalid');
  }
  return name;
}

/**
 * =============================================================================
 * Install / remove
 * =============================================================================
 */

async function ensureDirExists(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function extractModuleArchive(archivePath, extractDir) {
  await extractSafeZip({
    archivePath,
    destination: extractDir,
    label: 'Module archive',
    limits: MODULE_ARCHIVE_LIMITS,
  });
}

function isPathWithinDirectory(candidatePath, directoryPath) {
  const relativePath = relative(resolve(directoryPath), resolve(candidatePath));
  return (
    relativePath === '' ||
    (!relativePath.startsWith(`..${sep}`) &&
      relativePath !== '..' &&
      !isAbsolute(relativePath))
  );
}

// token -> { sourcePath, cleanupPath, moduleInfo, timer }
const pendingInstalls = new Map();
const PENDING_INSTALL_TTL = 10 * 60 * 1000; // 10 minutes

function stagePendingInstall({ sourcePath, cleanupPath, moduleInfo }) {
  const token = crypto.randomUUID();
  const timer = setTimeout(() => {
    const pending = pendingInstalls.get(token);
    pendingInstalls.delete(token);
    if (pending?.cleanupPath) {
      fsp.rm(pending.cleanupPath, { recursive: true, force: true }).catch(() => {});
    }
  }, PENDING_INSTALL_TTL);
  // Node timers keep the event loop alive; this one is non-critical.
  if (typeof timer.unref === 'function') timer.unref();
  pendingInstalls.set(token, { sourcePath, cleanupPath, moduleInfo, timer });
  return token;
}

function takePendingInstall(token) {
  const value = assertString(token, 'Install token', { min: 1, max: 128 });
  const pending = pendingInstalls.get(value);
  if (!pending) throw new Error('Install session has expired, please try again');
  clearTimeout(pending.timer);
  pendingInstalls.delete(value);
  return pending;
}

/**
 * Resolve a native file-dialog install source into a directory containing the
 * module to install, extracting archives into a managed temp directory as
 * needed.
 */
async function resolveInstallSource(sourcePath) {
  const source = assertString(sourcePath, 'Module source path', {
    min: 1,
    max: 4096,
  });
  let stat;
  try {
    stat = await fsp.lstat(source);
  } catch (err) {
    if (err?.code === 'ENOENT') throw new Error('Cannot find module');
    throw err;
  }
  if (stat.isSymbolicLink()) {
    throw new Error('Module source must not be a symbolic link');
  }
  if (stat.isFile()) {
    if (
      !SUPPORTED_ARCHIVE_EXTENSIONS.some((ext) =>
        source.toLowerCase().endsWith(ext)
      )
    ) {
      throw new Error('Unsupported file type');
    }
    if (stat.size > MAX_MODULE_ARCHIVE_BYTES) {
      throw new Error('Archive exceeds the compressed size limit');
    }
    await ensureDirExists(temporaryModuleDir);
    const extractDir = join(temporaryModuleDir, crypto.randomUUID());
    try {
      await extractModuleArchive(source, extractDir);

      let resolvedDir = extractDir;
      // In case the module is wrapped inside a sub directory of the archive file
      const subItems = await fsp.readdir(extractDir);
      if (subItems.length === 1) {
        const subItemPath = join(extractDir, subItems[0]);
        const subItemStat = await fsp.lstat(subItemPath);
        if (subItemStat.isDirectory() && !subItemStat.isSymbolicLink()) {
          resolvedDir = subItemPath;
        }
      }
      return { dirPath: resolvedDir, cleanupPath: extractDir };
    } catch (err) {
      await fsp.rm(extractDir, { recursive: true, force: true });
      throw err;
    }
  }

  if (!stat.isDirectory()) {
    throw new Error('Module source must be a file or directory');
  }
  if (isPathWithinDirectory(source, modulesDir)) {
    throw new Error('Cannot install from this location');
  }
  // Mutable user-selected directories cannot be copied safely without
  // descriptor-relative no-follow traversal (unavailable on Windows). Fail
  // closed rather than path-snapshotting a junction-racy tree. Module archives
  // extract into an app-owned temp directory and remain supported.
  if (!supportsFdRelativeOpen()) {
    throw new Error(
      'Installing from a module directory is not supported on this platform; package the module as a .zip archive'
    );
  }
  return { dirPath: resolve(source), cleanupPath: undefined };
}

/**
 * Inspect a module install source: extracts archives if necessary, validates
 * and loads the module descriptor, and stages it for a follow-up `install`
 * call. Never exposes filesystem paths to the renderer.
 */
export async function inspectInstallSource(sourcePath) {
  const { dirPath, cleanupPath } = await resolveInstallSource(sourcePath);
  try {
    const settings = loadSettingsFromFile();
    const module = await loadModuleFromDir(dirPath, settings);
    const alreadyInstalled = fs.existsSync(join(modulesDir, module.info.name));
    const token = stagePendingInstall({
      sourcePath: dirPath,
      cleanupPath,
      moduleInfo: module.info,
    });
    return { token, module, alreadyInstalled };
  } catch (err) {
    if (cleanupPath) {
      await fsp.rm(cleanupPath, { recursive: true, force: true });
    }
    throw err;
  }
}

function sameModuleFileList(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  const sortedLeft = left.map(String).sort();
  const sortedRight = right.map(String).sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

/**
 * Finalize an install previously staged by `inspectInstallSource` (or
 * `downloadAndInstall`). Throws `ALREADY_EXISTS` if the destination exists
 * and the caller did not explicitly confirm an overwrite.
 */
export async function finalizeInstall({ token, overwrite }) {
  const pending = takePendingInstall(token);
  try {
    const settings = loadSettingsFromFile();
    // Re-validate the staged module right before installing, in case
    // anything on disk changed since it was inspected.
    const module = await loadModuleFromDir(pending.sourcePath, settings);
    const expectedName = module.info.name;
    const expectedFiles = [...module.info.files].map(String);
    const dest = join(modulesDir, expectedName);

    // Copy through an app-owned staging directory and rename into place so a
    // failed install cannot leave a partial module tree at the final path.
    // safeCopy also rejects intermediate-directory symlink TOCTOU races.
    // Verify the app-owned staging tree before publish so a mutable source
    // cannot swap nxs_package.json (name/file list) after the copy plan was
    // captured and leave a broken or mismatched module at the final path.
    // Overwrite installs keep the existing module until staging verifies;
    // installModuleDirectory then swaps it out with rollback on failure.
    await installModuleDirectory(expectedFiles, pending.sourcePath, dest, {
      overwrite: Boolean(overwrite),
      // Archive extracts land under application temp (cleanupPath set) and are
      // treated as app-owned trusted roots on platforms without fd-relative opens.
      trustedSource: Boolean(pending.cleanupPath),
      verifyStaging: async (stagingPath) => {
        const staged = await loadModuleFromDir(stagingPath, settings);
        if (staged.info.name !== expectedName) {
          throw new Error('Module name changed during install');
        }
        if (!sameModuleFileList(staged.info.files, expectedFiles)) {
          throw new Error('Module file list changed during install');
        }
      },
    });
    return loadModuleFromDir(dest, settings);
  } finally {
    await cleanupInternalModuleDirectories(modulesDir, {
      log: (message) => console.warn(message),
    }).catch(() => {});
    if (pending.cleanupPath) {
      fsp.rm(pending.cleanupPath, { recursive: true, force: true }).catch(() => {});
    }
  }
}

/**
 * Validate a development module directory and return its parsed descriptor.
 * Persisting the directory into `devModulePaths` remains the renderer's
 * responsibility (it already goes through the `settings:update` operation).
 */
export async function addDevelopmentModule(dirPath) {
  const path = assertString(dirPath, 'Development module path', { min: 1, max: 4096 });
  if (!fs.existsSync(path)) {
    throw new Error('Directory does not exist');
  }
  return loadDevModuleFromDir(path);
}

export async function removeModule(name) {
  const moduleName = assertSafeModuleName(name);
  const { root, development } = await resolveModuleRoot(moduleName);
  if (development) {
    throw new Error('Development modules are removed by updating settings, not by this operation');
  }
  await fsp.rm(root, { recursive: true, force: true });
}

/**
 * =============================================================================
 * Storage (per-module storage.json)
 * =============================================================================
 */

const STORAGE_FILE_NAME = 'storage.json';
const MAX_STORAGE_BYTES = 1000000;

export async function readModuleStorage(name) {
  const moduleName = assertSafeModuleName(name);
  try {
    const { root } = await resolveModuleRoot(moduleName);
    const storagePath = join(root, STORAGE_FILE_NAME);
    const stat = await fsp.stat(storagePath);
    if (!stat.isFile()) return {};
    const content = await fsp.readFile(storagePath);
    return JSON.parse(String(content));
  } catch (err) {
    if (err?.code !== 'ENOENT') console.error(err);
    return {};
  }
}

export async function writeModuleStorage(name, data) {
  const moduleName = assertSafeModuleName(name);
  const value = assertRecord(data ?? {}, 'Module storage data');
  const content = JSON.stringify(value);
  if (content.length > MAX_STORAGE_BYTES) {
    throw new Error('Module storage data must not exceed 1MB');
  }
  const { root } = await resolveModuleRoot(moduleName);
  const storagePath = join(root, STORAGE_FILE_NAME);
  await fsp.writeFile(storagePath, content);
}

/**
 * =============================================================================
 * Download & install from a GitHub release asset
 * =============================================================================
 */

// moduleName -> in-flight http(s) ClientRequest, so downloads can be aborted.
const downloadRequests = new Map();

function sendDownloadProgress(moduleName, progress) {
  try {
    global.mainWindow?.webContents.send(EVENTS.modules.downloadProgress, {
      moduleName,
      ...progress,
    });
  } catch {
    // Renderer may not be listening (older preload build); safe to ignore.
  }
}

function downloadToFile(url, filePath, moduleName, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    let file;
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (err) {
        file?.destroy();
        reject(err);
      } else {
        resolve(filePath);
      }
    };
    const request = https
      .get(url)
      .setTimeout(180000)
      .on('response', (response) => {
        if (String(response.statusCode).startsWith('3') && response.headers.location) {
          response.resume();
          if (redirectCount >= 5) {
            finish(new Error('Too many redirects while downloading module archive'));
            return;
          }
          downloadToFile(
            response.headers.location,
            filePath,
            moduleName,
            redirectCount + 1
          )
            .then(() => finish())
            .catch(finish);
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          response.resume();
          finish(
            new Error(
              `Module archive download failed: HTTP ${response.statusCode}`
            )
          );
          return;
        }

        const totalSize = parseInt(response.headers['content-length'] || '', 10);
        if (Number.isFinite(totalSize) && totalSize > MAX_MODULE_ARCHIVE_BYTES) {
          response.resume();
          finish(new Error('Module archive exceeds the compressed size limit'));
          return;
        }
        let downloaded = 0;
        file = fs.createWriteStream(filePath, { mode: 0o600 });

        response
          .on('data', (chunk) => {
            downloaded += chunk.length;
            if (downloaded > MAX_MODULE_ARCHIVE_BYTES) {
              const err = new Error(
                'Module archive exceeds the compressed size limit'
              );
              response.destroy(err);
              finish(err);
              return;
            }
            sendDownloadProgress(moduleName, { downloaded, totalSize, downloading: true });
          })
          .on('error', finish)
          .pipe(file);
        file.on('error', finish).on('finish', () => finish());
      })
      .on('error', finish)
      .on('timeout', () => {
        request.destroy(new Error('Request timeout!'));
      });
    downloadRequests.set(moduleName, request);
  });
}

export async function downloadAndInstallModule({ moduleName, owner, repo, releaseId }) {
  const safeModuleName = assertSafeModuleName(moduleName);
  let filePath;
  try {
    sendDownloadProgress(safeModuleName, { downloading: true });

    let resolvedReleaseId = releaseId;
    if (releaseId === 'latest') {
      const { data: release } = await fetchGithubLatestRelease(getRepoId({ owner, repo }), {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      resolvedReleaseId = release.id;
    }

    const { data: releaseAssets } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/releases/${resolvedReleaseId}/assets`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    const asset = releaseAssets.find(
      ({ name }) => name.startsWith(safeModuleName) && name.endsWith('.zip')
    );
    if (!asset) {
      throw new Error('Cannot find module archive file among assets');
    }

    await ensureDirExists(moduleDownloadDir);
    filePath = join(moduleDownloadDir, `${safeModuleName}-${crypto.randomUUID()}.zip`);
    await downloadToFile(asset.browser_download_url, filePath, safeModuleName);

    return await inspectInstallSource(filePath);
  } finally {
    downloadRequests.delete(safeModuleName);
    sendDownloadProgress(safeModuleName, { downloading: false });
    if (filePath) {
      fsp.unlink(filePath).catch(() => {});
    }
  }
}

export function abortDownload(name) {
  const request = downloadRequests.get(name);
  if (request) request.destroy();
  downloadRequests.delete(name);
}

/**
 * =============================================================================
 * Featured modules feed
 * =============================================================================
 */

export async function getFeaturedModules() {
  const response = await axios.get(
    `https://nexus-featured-modules.netlify.app/featured-modules?wallet_version=${APP_VERSION}`
  );
  return response.data;
}

export async function checkForModuleUpdates() {
  const { modules } = await listModules();
  const results = await Promise.allSettled(
    modules
      .filter((module) => !module.development && module.repository)
      .map(async (module) => {
        const { owner, repo } = module.repository;
        const response = await fetchGithubLatestRelease(getRepoId({ owner, repo }), {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        const release = response?.data;
        const latestVersion =
          typeof release?.tag_name === 'string'
            ? release.tag_name.replace(/^v/, '')
            : '';
        if (
          !Number.isSafeInteger(release?.id) ||
          !release.assets ||
          !semver.valid(latestVersion) ||
          !semver.valid(module.info.version) ||
          !semver.gt(latestVersion, module.info.version)
        ) {
          return null;
        }
        return {
          moduleName: module.info.name,
          latestVersion,
          latestRelease: {
            id: release.id,
            tag_name: release.tag_name,
            assets: true,
          },
        };
      })
  );
  return results
    .filter(({ status, value }) => status === 'fulfilled' && value)
    .map(({ value }) => value);
}

/**
 * =============================================================================
 * Misc
 * =============================================================================
 */

export async function proxyRequest() {
  // Removed for third-party modules: generic network proxy enables SSRF and
  // data exfiltration. Modules must not receive unrestricted network access.
  throw new Error(
    'proxyRequest is disabled. NEXUS v2 does not expose a generic network proxy.'
  );
}
