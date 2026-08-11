'use strict';

/**
 * Safe module-file copy helpers.
 *
 * Directory installs can race between path inspection and open. O_NOFOLLOW only
 * protects the final path component, so intermediate directory symlinks must be
 * rejected as well. Files are opened via descriptor-relative no-follow traversal
 * wherever the platform supports it, then re-checked for confinement using the
 * opened fd before bytes are returned.
 */

const crypto = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const DEFAULT_MAX_FILE_BYTES = 100 * 1024 * 1024;
const STAGING_DIR_INFIX = '.installing-';
const REPLACED_DIR_INFIX = '.replaced-';
const READ_CHUNK_BYTES = 64 * 1024;
const COPY_CONCURRENCY = 1;
const publishLocks = new Map();
/** Absolute paths of staging/backup dirs currently owned by an in-flight install. */
const activeInternalPaths = new Set();

function registerActiveInternalPath(dirPath) {
  activeInternalPaths.add(path.resolve(dirPath));
}

function unregisterActiveInternalPath(dirPath) {
  activeInternalPaths.delete(path.resolve(dirPath));
}

function isActiveInternalPath(dirPath) {
  return activeInternalPaths.has(path.resolve(dirPath));
}

function isPathWithinDirectory(candidatePath, directoryPath) {
  const relativePath = path.relative(
    path.resolve(directoryPath),
    path.resolve(candidatePath)
  );
  return (
    relativePath === '' ||
    (!relativePath.startsWith(`..${path.sep}`) &&
      relativePath !== '..' &&
      !path.isAbsolute(relativePath))
  );
}

function assertPathInsideRoot(candidatePath, rootPath, label) {
  if (!isPathWithinDirectory(candidatePath, rootPath)) {
    throw new Error(`${label} realpath escapes module root`);
  }
}

function hasNoFollowOpen() {
  return typeof fs.constants.O_NOFOLLOW === 'number';
}

function hasDirectoryOpen() {
  return typeof fs.constants.O_DIRECTORY === 'number';
}

/**
 * Path that refers to an open directory fd so child opens are descriptor-
 * relative (openat-style) rather than re-walking a mutable path string.
 */
function directoryFdPath(fd) {
  if (typeof fd !== 'number' || fd < 0) {
    throw new Error('Invalid directory file descriptor');
  }
  if (process.platform === 'linux') {
    return `/proc/self/fd/${fd}`;
  }
  // macOS / BSD
  return `/dev/fd/${fd}`;
}

function detectSupportsFdRelativeOpen() {
  return (
    hasNoFollowOpen() &&
    hasDirectoryOpen() &&
    (process.platform === 'linux' ||
      process.platform === 'darwin' ||
      process.platform === 'freebsd' ||
      process.platform === 'openbsd')
  );
}

/** @type {boolean|undefined} Test-only override for platform capability. */
let supportsFdRelativeOpenOverride;

function supportsFdRelativeOpen() {
  if (typeof supportsFdRelativeOpenOverride === 'boolean') {
    return supportsFdRelativeOpenOverride;
  }
  return detectSupportsFdRelativeOpen();
}

/**
 * Test hook so Linux CI can exercise the Windows fail-closed branch without a
 * Windows runner. Pass `null`/`undefined` to restore auto-detection.
 * @param {boolean|null|undefined} value
 */
function setSupportsFdRelativeOpenForTests(value) {
  if (value !== undefined && value !== null && typeof value !== 'boolean') {
    throw new TypeError('supportsFdRelativeOpen override must be a boolean');
  }
  supportsFdRelativeOpenOverride =
    typeof value === 'boolean' ? value : undefined;
}

/**
 * Reject symlink path components from root through the leaf. Used as a fast
 * pre-check and as a fallback on platforms without fd-relative open.
 */
async function assertNoSymlinkComponents(rootPath, targetPath, label) {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(targetPath);
  assertPathInsideRoot(resolvedTarget, resolvedRoot, label);

  const rootStat = await fsp.lstat(resolvedRoot);
  if (rootStat.isSymbolicLink()) {
    throw new Error(`${label} module root must not be a symbolic link`);
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`${label} module root must be a directory`);
  }

  const relativePath = path.relative(resolvedRoot, resolvedTarget);
  if (!relativePath) return;

  let current = resolvedRoot;
  for (const segment of relativePath.split(path.sep)) {
    if (!segment || segment === '.' || segment === '..') {
      throw new Error(`${label} contains an unsafe path segment`);
    }
    current = path.join(current, segment);
    let stat;
    try {
      stat = await fsp.lstat(current);
    } catch (err) {
      if (err?.code === 'ENOENT') {
        throw new Error(`${label} not found`);
      }
      throw err;
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} path contains a symbolic link`);
    }
  }
}

async function resolveOpenedPath(handle, openPath) {
  if (typeof handle.fd === 'number') {
    if (process.platform === 'linux') {
      try {
        const fdPath = await fsp.readlink(`/proc/self/fd/${handle.fd}`);
        try {
          return await fsp.realpath(fdPath);
        } catch {
          return path.resolve(fdPath);
        }
      } catch {
        // Fall through.
      }
    } else if (
      process.platform === 'darwin' ||
      process.platform === 'freebsd' ||
      process.platform === 'openbsd'
    ) {
      // Prefer handle identity via /dev/fd rather than the mutable open path.
      try {
        return await fsp.realpath(`/dev/fd/${handle.fd}`);
      } catch {
        try {
          const fdPath = await fsp.readlink(`/dev/fd/${handle.fd}`);
          return path.resolve(fdPath);
        } catch {
          // Fall through.
        }
      }
    }
  }
  // Last resort: never treat this as a strong binding on its own.
  return fsp.realpath(openPath);
}

async function assertOpenedFileInsideRoot(handle, openPath, rootPath, label) {
  const realRoot = await fsp.realpath(rootPath);
  const openedPath = await resolveOpenedPath(handle, openPath);
  assertPathInsideRoot(openedPath, realRoot, label);

  const stat = await handle.stat();
  if (!stat.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file`);
  }
  return { stat, openedPath, realRoot };
}

function splitRelativeSegments(rootPath, targetPath, label) {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(targetPath);
  assertPathInsideRoot(resolvedTarget, resolvedRoot, label);
  const relativePath = path.relative(resolvedRoot, resolvedTarget);
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new Error(`${label} must be a file inside the module root`);
  }
  const segments = relativePath.split(path.sep).filter(Boolean);
  if (
    !segments.length ||
    segments.some((segment) => segment === '.' || segment === '..')
  ) {
    throw new Error(`${label} contains an unsafe path segment`);
  }
  return { resolvedRoot, resolvedTarget, segments };
}

/**
 * Read at most maxBytes from an open file handle. Caps allocation even when the
 * underlying inode grows between stat and read by stopping at maxBytes + 1.
 *
 * When the handle exposes a verified size, allocate the result once and probe a
 * single extra byte for growth so a near-limit file does not peak at ~2x by
 * retaining both chunk list and Buffer.concat output. Without a size, grow one
 * buffer in place up to the cap instead of concatenating retained chunks.
 */
async function readFileHandleBounded(handle, maxBytes, label) {
  if (!Number.isFinite(maxBytes) || maxBytes < 0) {
    throw new Error(`${label} has an invalid size limit`);
  }
  const limit = Math.floor(maxBytes);

  let expectedSize = null;
  if (typeof handle.stat === 'function') {
    const stat = await handle.stat();
    if (!Number.isFinite(stat?.size) || stat.size < 0) {
      throw new Error(`${label} has an invalid size`);
    }
    if (stat.size > limit) {
      throw new Error(`${label} exceeds the size limit`);
    }
    expectedSize = stat.size;
  }

  if (expectedSize !== null) {
    const buffer =
      expectedSize === 0 ? Buffer.alloc(0) : Buffer.allocUnsafe(expectedSize);
    let total = 0;
    while (total < expectedSize) {
      const { bytesRead } = await handle.read(
        buffer,
        total,
        Math.min(READ_CHUNK_BYTES, expectedSize - total),
        total
      );
      if (bytesRead === 0) {
        break;
      }
      total += bytesRead;
    }
    // Probe separately for growth beyond the verified size without keeping a
    // second full copy of the file contents.
    const probe = Buffer.allocUnsafe(1);
    const { bytesRead: extra } = await handle.read(probe, 0, 1, total);
    if (extra > 0) {
      throw new Error(`${label} exceeds the size limit`);
    }
    return total === expectedSize ? buffer : buffer.subarray(0, total);
  }

  // Size unavailable (tests / unusual handles): one growable buffer capped at
  // limit + 1, never a retained chunk list plus Buffer.concat duplicate.
  const cap = limit + 1;
  let buffer = Buffer.allocUnsafe(Math.min(READ_CHUNK_BYTES, cap));
  let total = 0;
  while (total < cap) {
    if (total === buffer.length) {
      const nextLength = Math.min(Math.max(buffer.length * 2, 1), cap);
      if (nextLength <= buffer.length) {
        break;
      }
      const resized = Buffer.allocUnsafe(nextLength);
      buffer.copy(resized, 0, 0, total);
      buffer = resized;
    }
    const { bytesRead } = await handle.read(
      buffer,
      total,
      buffer.length - total,
      total
    );
    if (bytesRead === 0) {
      break;
    }
    total += bytesRead;
  }
  if (total > limit) {
    throw new Error(`${label} exceeds the size limit`);
  }
  if (total === 0) {
    return Buffer.alloc(0);
  }
  return total === buffer.length ? buffer : buffer.subarray(0, total);
}

/**
 * Open a file under root using descriptor-relative O_NOFOLLOW opens for every
 * path component so intermediate directory swaps cannot redirect the walk.
 */
async function openRegularFileNoFollowFdRelative(
  filePath,
  rootPath,
  label,
  maxBytes
) {
  const { resolvedRoot, segments } = splitRelativeSegments(
    rootPath,
    filePath,
    label
  );

  const rootStat = await fsp.lstat(resolvedRoot);
  if (rootStat.isSymbolicLink()) {
    throw new Error(`${label} module root must not be a symbolic link`);
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`${label} module root must be a directory`);
  }

  // O_NOFOLLOW on the root open closes the lstat→open TOCTOU where the root
  // itself is replaced with a symlink and the walk would otherwise anchor
  // outside the intended module tree.
  let dirHandle;
  try {
    dirHandle = await fsp.open(
      resolvedRoot,
      fs.constants.O_RDONLY |
        fs.constants.O_DIRECTORY |
        fs.constants.O_NOFOLLOW
    );
  } catch (err) {
    if (
      err?.code === 'ELOOP' ||
      err?.code === 'EMLINK' ||
      err?.code === 'EINVAL'
    ) {
      throw new Error(`${label} module root must not be a symbolic link`);
    }
    throw err;
  }
  try {
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const isLast = index === segments.length - 1;
      const flags =
        fs.constants.O_RDONLY |
        fs.constants.O_NOFOLLOW |
        (isLast ? 0 : fs.constants.O_DIRECTORY);
      const childPath = path.join(directoryFdPath(dirHandle.fd), segment);
      let nextHandle;
      try {
        nextHandle = await fsp.open(childPath, flags);
      } catch (err) {
        if (
          err?.code === 'ELOOP' ||
          err?.code === 'EMLINK' ||
          err?.code === 'EINVAL'
        ) {
          throw new Error(`${label} path contains a symbolic link`);
        }
        if (err?.code === 'ENOENT') {
          throw new Error(`${label} not found`);
        }
        if (err?.code === 'ENOTDIR') {
          throw new Error(
            isLast
              ? `${label} must be a regular non-symlink file`
              : `${label} path contains a symbolic link`
          );
        }
        throw err;
      }
      const previousHandle = dirHandle;
      dirHandle = nextHandle;
      await previousHandle.close().catch(() => {});

      if (isLast) {
        const { stat } = await assertOpenedFileInsideRoot(
          dirHandle,
          childPath,
          resolvedRoot,
          label
        );
        if (stat.size > maxBytes) {
          throw new Error(`${label} exceeds the size limit`);
        }
        const content = await readFileHandleBounded(
          dirHandle,
          maxBytes,
          label
        );
        const handle = dirHandle;
        dirHandle = null;
        try {
          return content;
        } finally {
          await handle.close();
        }
      }
    }
    throw new Error(`${label} not found`);
  } finally {
    if (dirHandle) {
      await dirHandle.close().catch(() => {});
    }
  }
}

/**
 * Best-effort path-based read used only against an already app-owned tree
 * whose parents the untrusted module author cannot replace (for example an
 * archive extract under the application temp directory). Mutable user-selected
 * install sources must not use this path: platforms without fd-relative opens
 * fail closed instead.
 */
async function readRegularFileFromTrustedRoot(
  filePath,
  { root, label = filePath, maxBytes = DEFAULT_MAX_FILE_BYTES } = {}
) {
  const resolvedFile = path.resolve(filePath);
  const resolvedRoot = path.resolve(root);
  assertPathInsideRoot(resolvedFile, resolvedRoot, label);
  await assertNoSymlinkComponents(resolvedRoot, resolvedFile, label);

  const before = await fsp.lstat(resolvedFile);
  if (before.isSymbolicLink() || !before.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file`);
  }
  if (before.size > maxBytes) {
    throw new Error(`${label} exceeds the size limit`);
  }

  if (hasNoFollowOpen()) {
    const handle = await fsp.open(
      resolvedFile,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW
    );
    try {
      const { stat } = await assertOpenedFileInsideRoot(
        handle,
        resolvedFile,
        resolvedRoot,
        label
      );
      if (stat.size > maxBytes) {
        throw new Error(`${label} exceeds the size limit`);
      }
      await assertNoSymlinkComponents(resolvedRoot, resolvedFile, label);
      return await readFileHandleBounded(handle, maxBytes, label);
    } finally {
      await handle.close();
    }
  }

  // No O_NOFOLLOW: read through a size-capped stream so a growing file cannot
  // force unbounded main-process allocation, then re-check identity metadata.
  const handle = await fsp.open(resolvedFile, fs.constants.O_RDONLY);
  let content;
  try {
    content = await readFileHandleBounded(handle, maxBytes, label);
  } finally {
    await handle.close();
  }
  const after = await fsp.lstat(resolvedFile);
  if (
    after.isSymbolicLink() ||
    !after.isFile() ||
    after.size !== before.size ||
    after.mtimeMs !== before.mtimeMs ||
    after.ino !== before.ino ||
    after.dev !== before.dev
  ) {
    throw new Error(`${label} changed during install`);
  }
  await assertNoSymlinkComponents(resolvedRoot, resolvedFile, label);
  const realFile = await fsp.realpath(resolvedFile);
  const realRoot = await fsp.realpath(resolvedRoot);
  assertPathInsideRoot(realFile, realRoot, label);
  return content;
}

/**
 * Read a regular file under root without following leaf or intermediate
 * symlinks. Used to safely read source files during module installation.
 *
 * On platforms without descriptor-relative no-follow opens (notably Windows),
 * path-based reads of a mutable source remain TOCTOU-prone. Mutable directory
 * installs therefore fail closed; callers may only opt into the path fallback
 * for already app-owned trees (archive extracts, installed module roots).
 */
async function readRegularFileNoFollow(
  filePath,
  {
    root,
    label = filePath,
    maxBytes = DEFAULT_MAX_FILE_BYTES,
    allowPathFallback = false,
  } = {}
) {
  if (!root) {
    throw new TypeError('readRegularFileNoFollow requires a root directory');
  }

  const resolvedFile = path.resolve(filePath);
  const resolvedRoot = path.resolve(root);
  assertPathInsideRoot(resolvedFile, resolvedRoot, label);

  if (supportsFdRelativeOpen()) {
    return openRegularFileNoFollowFdRelative(
      resolvedFile,
      resolvedRoot,
      label,
      maxBytes
    );
  }

  // Windows and other platforms without openat-style fd paths cannot bind
  // intermediate components to directory handles. Refuse path-based reads of
  // mutable sources unless the caller explicitly opts into a trusted-root
  // fallback (app-owned extract/install trees only).
  if (!allowPathFallback) {
    throw new Error(
      `${label} secure module file reads require descriptor-relative opens or an app-owned trusted root`
    );
  }

  return readRegularFileFromTrustedRoot(resolvedFile, {
    root: resolvedRoot,
    label,
    maxBytes,
  });
}

async function ensureDirExists(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

function isSafeCopyInternalDirectoryName(name) {
  return (
    typeof name === 'string' &&
    name.startsWith('.') &&
    (name.includes(STAGING_DIR_INFIX) || name.includes(REPLACED_DIR_INFIX))
  );
}

/**
 * Parse `.${destName}.installing-${id}` / `.${destName}.replaced-${id}` names.
 * Returns null when the entry is not a well-formed internal install directory.
 */
function parseInternalModuleDirectoryName(name) {
  if (!isSafeCopyInternalDirectoryName(name)) {
    return null;
  }
  const body = name.slice(1);
  let kind = null;
  let infix = null;
  if (body.includes(STAGING_DIR_INFIX)) {
    kind = 'staging';
    infix = STAGING_DIR_INFIX;
  } else if (body.includes(REPLACED_DIR_INFIX)) {
    kind = 'replaced';
    infix = REPLACED_DIR_INFIX;
  } else {
    return null;
  }
  const infixIndex = body.indexOf(infix);
  if (infixIndex <= 0) {
    return null;
  }
  const destName = body.slice(0, infixIndex);
  const suffix = body.slice(infixIndex + infix.length);
  if (
    !destName ||
    destName.includes(path.sep) ||
    destName === '.' ||
    destName === '..' ||
    !suffix
  ) {
    return null;
  }
  return { kind, destName, suffix };
}

async function cleanupInternalModuleDirectory(
  modulesRoot,
  entryName,
  { log = console.warn } = {}
) {
  if (!isSafeCopyInternalDirectoryName(entryName)) {
    return false;
  }

  const rootPath = path.resolve(modulesRoot);
  const targetPath = path.join(rootPath, entryName);
  if (!isPathWithinDirectory(targetPath, rootPath)) {
    log(
      `[modules] Refusing to clean internal install directory outside modulesDir: ${entryName}`
    );
    return false;
  }

  // In-flight installs own their staging/backup trees; inventory/finalize
  // cleanup must not remove them out from under copy or rename.
  if (isActiveInternalPath(targetPath)) {
    return false;
  }

  let stat;
  try {
    stat = await fsp.lstat(targetPath);
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return false;
    }
    throw err;
  }

  if (stat.isSymbolicLink()) {
    log(
      `[modules] Skipping internal install cleanup for symbolic link entry: ${targetPath}`
    );
    return false;
  }

  if (!stat.isDirectory()) {
    log(
      `[modules] Skipping internal install cleanup for non-directory entry: ${targetPath}`
    );
    return false;
  }

  const parsed = parseInternalModuleDirectoryName(entryName);
  if (parsed?.kind === 'replaced') {
    const publicDest = path.join(rootPath, parsed.destName);
    if (
      parsed.destName &&
      isPathWithinDirectory(publicDest, rootPath) &&
      path.basename(publicDest) === parsed.destName
    ) {
      let publicExists = false;
      try {
        await fsp.lstat(publicDest);
        publicExists = true;
      } catch (err) {
        if (err?.code !== 'ENOENT') {
          throw err;
        }
      }

      // After interruption between rename-aside and publish, the backup may be
      // the only recoverable module tree. Restore it instead of deleting.
      if (!publicExists) {
        try {
          await fsp.rename(targetPath, publicDest);
          return true;
        } catch (err) {
          log(
            `[modules] Failed to restore replaced module backup ${targetPath} -> ${publicDest}: ${err?.code || 'ERR'} ${err?.message || String(err)}`
          );
          return false;
        }
      }
    }
  }

  try {
    await fsp.rm(targetPath, { recursive: true, force: true });
    return true;
  } catch (err) {
    log(
      `[modules] Failed to clean internal install directory ${targetPath}: ${err?.code || 'ERR'} ${err?.message || String(err)}`
    );
    return false;
  }
}

async function cleanupInternalModuleDirectories(modulesRoot, options = {}) {
  let childNames = [];
  try {
    childNames = await fsp.readdir(modulesRoot);
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const cleaned = [];
  for (const entryName of childNames) {
    if (
      await cleanupInternalModuleDirectory(modulesRoot, entryName, options)
    ) {
      cleaned.push(entryName);
    }
  }
  return cleaned;
}

async function listPublicModuleDirectoryNames(modulesRoot, options = {}) {
  await cleanupInternalModuleDirectories(modulesRoot, options);

  let childNames = [];
  try {
    childNames = await fsp.readdir(modulesRoot);
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const publicNames = [];
  for (const name of childNames) {
    if (isSafeCopyInternalDirectoryName(name)) {
      continue;
    }
    const childPath = path.join(modulesRoot, name);
    let stat;
    try {
      stat = await fsp.stat(childPath);
    } catch (err) {
      if (err?.code === 'ENOENT') {
        continue;
      }
      throw err;
    }
    if (stat.isDirectory()) {
      publicNames.push(name);
    }
  }
  return publicNames;
}

async function withSerializedPublication(destPath, worker) {
  const key = path.resolve(destPath);
  const previous = publishLocks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  // Future same-destination callers intentionally wait on `tail`, which does
  // not settle until this call's finally block invokes `release()`.
  const tail = previous.catch(() => {}).then(() => current);
  publishLocks.set(key, tail);
  await previous.catch(() => {});
  try {
    return await worker();
  } finally {
    release();
    if (publishLocks.get(key) === tail) {
      publishLocks.delete(key);
    }
  }
}

async function mapPool(items, concurrency, worker) {
  if (!items.length) return [];
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => run()));
  return results;
}

function collectUniqueModuleFiles(files) {
  // Deduplicate declared paths so exclusive wx writes cannot race on duplicates.
  return [
    'nxs_package.json',
    ...new Set(
      files
        .map((file) => String(file))
        .filter(
          (file) => file !== 'nxs_package.json' && file !== 'repo_info.json'
        )
    ),
  ];
}

async function appendOptionalRepoInfo(uniqueFiles, sourceRoot) {
  const repoInfoPath = path.join(sourceRoot, 'repo_info.json');
  try {
    const stat = await fsp.lstat(repoInfoPath);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error('repo_info.json must be a regular non-symlink file');
    }
    if (!uniqueFiles.includes('repo_info.json')) {
      uniqueFiles.push('repo_info.json');
    }
  } catch (err) {
    if (err?.code !== 'ENOENT') throw err;
  }
  return uniqueFiles;
}

/**
 * Copy declared module files from source to dest without following symlinks.
 * Destination files are created exclusively (wx).
 *
 * On platforms without descriptor-relative no-follow traversal (Windows),
 * mutable user-controlled sources fail closed: path-based snapshotting cannot
 * bind intermediate components and remains TOCTOU-prone against junctions.
 * Only already app-owned trees may set trustedSource (archive extracts under
 * application temp).
 */
async function copyModuleFiles(
  files,
  source,
  dest,
  {
    maxBytes = DEFAULT_MAX_FILE_BYTES,
    trustedSource = false,
  } = {}
) {
  const destRoot = path.resolve(dest);
  const sourceRoot = path.resolve(source);

  if (!supportsFdRelativeOpen() && !trustedSource) {
    throw new Error(
      'Secure module directory installs require descriptor-relative opens on this platform; use a module archive or an app-owned trusted source'
    );
  }

  const copyOne = async (file) => {
    const relativeFile = String(file);
    if (
      !relativeFile ||
      relativeFile.includes('\0') ||
      path.isAbsolute(relativeFile)
    ) {
      throw new Error(`Invalid module file path: ${relativeFile}`);
    }

    const from = path.join(sourceRoot, relativeFile);
    const to = path.join(destRoot, relativeFile);
    if (!isPathWithinDirectory(from, sourceRoot)) {
      throw new Error(`${relativeFile} escapes module root`);
    }
    if (!isPathWithinDirectory(to, destRoot)) {
      throw new Error(`${relativeFile} escapes install destination`);
    }

    await ensureDirExists(path.dirname(to));
    const content = await readRegularFileNoFollow(from, {
      root: sourceRoot,
      label: relativeFile,
      maxBytes,
      // Trusted roots are app-owned; path fallback is only for that case when
      // fd-relative opens are unavailable.
      allowPathFallback: trustedSource,
    });
    await fsp.writeFile(to, content, { flag: 'wx' });
  };

  const uniqueFiles = await appendOptionalRepoInfo(
    collectUniqueModuleFiles(files),
    sourceRoot
  );

  // Sequential by default to bound peak memory and open file descriptors.
  await mapPool(uniqueFiles, COPY_CONCURRENCY, copyOne);
}

/**
 * Copy into an application-owned staging directory, then rename into place.
 * Avoids leaving a half-written destination module directory on failure.
 *
 * When the destination already exists (overwrite installs), the previous tree
 * is moved aside only after staging verifies successfully, then swapped with
 * rollback if the final rename fails — so a failed overwrite leaves the prior
 * install intact.
 */
async function installModuleDirectory(
  files,
  source,
  dest,
  {
    maxBytes = DEFAULT_MAX_FILE_BYTES,
    overwrite = true,
    verifyStaging,
    trustedSource = false,
  } = {}
) {
  const destPath = path.resolve(dest);
  return withSerializedPublication(destPath, async () => {
    const destParent = path.dirname(destPath);
    const destName = path.basename(destPath);
    const stagingPath = path.join(
      destParent,
      `.${destName}${STAGING_DIR_INFIX}${crypto.randomUUID()}`
    );

    await ensureDirExists(destParent);
    // Register before mkdir so concurrent inventory cleanup cannot treat the
    // new staging directory as a stale leftover during the post-create gap.
    registerActiveInternalPath(stagingPath);
    await fsp.mkdir(stagingPath, { recursive: false });
    let replacedPath = null;
    try {
      await copyModuleFiles(files, source, stagingPath, {
        maxBytes,
        trustedSource,
      });
      // Validate the app-owned staging tree before publishing so a source that
      // mutates after the copy plan was captured cannot land a mismatched
      // descriptor/file set at the final install path.
      if (typeof verifyStaging === 'function') {
        await verifyStaging(stagingPath);
      }

      // Publish while still holding the per-destination reservation so another
      // same-name install cannot change the overwrite decision mid-swap.
      try {
        await fsp.lstat(destPath);
        if (!overwrite) {
          const existsError = new Error(
            'A module with the same directory name already exists'
          );
          existsError.code = 'ALREADY_EXISTS';
          throw existsError;
        }
        replacedPath = path.join(
          destParent,
          `.${destName}${REPLACED_DIR_INFIX}${crypto.randomUUID()}`
        );
        // Register before rename so concurrent cleanup cannot delete the live
        // module tree while it is parked under the backup name.
        registerActiveInternalPath(replacedPath);
        await fsp.rename(destPath, replacedPath);
      } catch (err) {
        if (err?.code !== 'ENOENT') throw err;
      }

      await fsp.rename(stagingPath, destPath);
      unregisterActiveInternalPath(stagingPath);

      if (replacedPath) {
        try {
          await fsp.rm(replacedPath, { recursive: true, force: true });
        } catch (err) {
          // Install already published; allow later inventory cleanup to retry.
          console.warn(
            `[modules] Failed to remove replaced module backup ${replacedPath}: ${err?.code || 'ERR'} ${err?.message || String(err)}`
          );
        } finally {
          unregisterActiveInternalPath(replacedPath);
          replacedPath = null;
        }
      }
    } catch (err) {
      await fsp.rm(stagingPath, { recursive: true, force: true }).catch(() => {});
      if (replacedPath) {
        try {
          // Drop any partial publish before restoring the previous install.
          await fsp.rm(destPath, { recursive: true, force: true }).catch(() => {});
          await fsp.rename(replacedPath, destPath);
        } catch {
          // Prefer the original install error; a restore failure is secondary.
        } finally {
          unregisterActiveInternalPath(replacedPath);
          replacedPath = null;
        }
      }
      throw err;
    } finally {
      unregisterActiveInternalPath(stagingPath);
      if (replacedPath) {
        unregisterActiveInternalPath(replacedPath);
      }
    }
  });
}

module.exports = {
  DEFAULT_MAX_FILE_BYTES,
  READ_CHUNK_BYTES,
  STAGING_DIR_INFIX,
  REPLACED_DIR_INFIX,
  assertNoSymlinkComponents,
  cleanupInternalModuleDirectories,
  copyModuleFiles,
  installModuleDirectory,
  isActiveInternalPath,
  isSafeCopyInternalDirectoryName,
  isPathWithinDirectory,
  listPublicModuleDirectoryNames,
  parseInternalModuleDirectoryName,
  readFileHandleBounded,
  readRegularFileNoFollow,
  registerActiveInternalPath,
  setSupportsFdRelativeOpenForTests,
  supportsFdRelativeOpen,
  unregisterActiveInternalPath,
};
