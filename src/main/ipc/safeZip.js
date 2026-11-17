'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream/promises');
const yauzl = require('yauzl');

const ZIP_DIRECTORY_MODE = 0o040000;
const ZIP_REGULAR_FILE_MODE = 0o100000;
const ZIP_FILE_TYPE_MASK = 0o170000;
const MAX_ENTRY_PATH_LENGTH = 1024;
const MAX_PATH_SEGMENT_LENGTH = 255;

function archiveError(label, message) {
  return new Error(`${label} ${message}`);
}

function createArchiveState() {
  return {
    actualUncompressedSize: 0,
    entryCount: 0,
    entryPaths: new Set(),
    totalUncompressedSize: 0,
  };
}

function validateZipEntry(entry, state, limits, label = 'Archive') {
  const fileName = entry.fileName;
  const isDirectory = typeof fileName === 'string' && fileName.endsWith('/');
  const entryPath = isDirectory ? fileName.slice(0, -1) : fileName;
  if (
    typeof entryPath !== 'string' ||
    !entryPath ||
    entryPath.includes('\0') ||
    entryPath.includes('\\') ||
    entryPath.startsWith('/') ||
    /^[A-Za-z]:/.test(entryPath) ||
    entryPath.length > MAX_ENTRY_PATH_LENGTH ||
    entryPath.split('/').some((segment) =>
      !segment ||
      segment === '.' ||
      segment === '..' ||
      segment.length > MAX_PATH_SEGMENT_LENGTH
    )
  ) {
    throw archiveError(label, 'contains an unsafe entry path');
  }

  const uncompressedSize = entry.uncompressedSize;
  const compressedSize = entry.compressedSize;
  if (
    !Number.isSafeInteger(uncompressedSize) ||
    uncompressedSize < 0 ||
    !Number.isSafeInteger(compressedSize) ||
    compressedSize < 0
  ) {
    throw archiveError(label, 'contains an entry with an invalid size');
  }
  if (++state.entryCount > limits.maxEntries) {
    throw archiveError(label, 'contains too many entries');
  }
  if (state.entryPaths.has(entryPath)) {
    throw archiveError(label, 'contains duplicate entry paths');
  }
  state.entryPaths.add(entryPath);
  if (uncompressedSize > limits.maxEntryBytes) {
    throw archiveError(label, 'entry exceeds the size limit');
  }
  state.totalUncompressedSize += uncompressedSize;
  if (state.totalUncompressedSize > limits.maxExpandedBytes) {
    throw archiveError(label, 'exceeds the expanded size limit');
  }
  if (
    (uncompressedSize > 0 && compressedSize === 0) ||
    (compressedSize > 0 &&
      uncompressedSize > compressedSize * limits.maxCompressionRatio)
  ) {
    throw archiveError(label, 'entry exceeds the compression ratio limit');
  }
  if (typeof entry.isEncrypted === 'function' && entry.isEncrypted()) {
    throw archiveError(label, 'contains an encrypted entry');
  }

  const fileType = (entry.externalFileAttributes >>> 16) & ZIP_FILE_TYPE_MASK;
  if (
    fileType &&
    fileType !== ZIP_DIRECTORY_MODE &&
    fileType !== ZIP_REGULAR_FILE_MODE
  ) {
    throw archiveError(label, 'contains a link or unsupported file type');
  }
  return { entryPath, isDirectory };
}

function openZip(archivePath) {
  return new Promise((resolve, reject) => {
    yauzl.open(
      archivePath,
      {
        autoClose: false,
        lazyEntries: true,
        strictFileNames: true,
        validateEntrySizes: true,
      },
      (error, zipfile) => (error ? reject(error) : resolve(zipfile))
    );
  });
}

function collectEntries(zipfile, state, limits, label) {
  return new Promise((resolve, reject) => {
    const entries = [];
    let complete = false;
    const fail = (error) => {
      if (complete) return;
      complete = true;
      try {
        zipfile.close();
      } catch {
        // The ZIP reader may already have closed after a malformed archive.
      }
      reject(error);
    };

    zipfile.once('error', fail);
    zipfile.on('entry', (entry) => {
      if (complete) return;
      try {
        entries.push({
          entry,
          ...validateZipEntry(entry, state, limits, label),
        });
        zipfile.readEntry();
      } catch (error) {
        fail(error);
      }
    });
    zipfile.once('end', () => {
      if (complete) return;
      complete = true;
      resolve(entries);
    });
    zipfile.readEntry();
  });
}

async function ensureSafeDirectory(root, segments, label) {
  let currentPath = root;
  for (const segment of segments) {
    currentPath = path.join(currentPath, segment);
    try {
      await fsp.mkdir(currentPath, { mode: 0o700 });
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
    const stat = await fsp.lstat(currentPath);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw archiveError(label, 'would write through a symbolic link');
    }
  }
  return currentPath;
}

function openEntryStream(zipfile, entry) {
  return new Promise((resolve, reject) => {
    zipfile.openReadStream(entry, (error, stream) =>
      error ? reject(error) : resolve(stream)
    );
  });
}

async function extractFile(root, item, zipfile, state, limits, label) {
  const segments = item.entryPath.split('/');
  const fileName = segments.pop();
  const destinationDirectory = await ensureSafeDirectory(root, segments, label);
  const destination = path.join(destinationDirectory, fileName);
  const input = await openEntryStream(zipfile, item.entry);
  const output = fs.createWriteStream(destination, { flags: 'wx', mode: 0o600 });
  let actualSize = 0;
  input.on('data', (chunk) => {
    actualSize += chunk.length;
    state.actualUncompressedSize += chunk.length;
    if (
      actualSize > limits.maxEntryBytes ||
      state.actualUncompressedSize > limits.maxExpandedBytes
    ) {
      input.destroy(archiveError(label, 'exceeds the expanded size limit'));
    }
  });
  await pipeline(input, output);
  if (actualSize !== item.entry.uncompressedSize) {
    throw archiveError(label, 'entry size does not match its archive metadata');
  }
}

async function extractSafeZip({
  archivePath,
  destination,
  limits,
  label = 'Archive',
  onPreflight,
}) {
  if (!path.isAbsolute(destination)) {
    throw archiveError(label, 'destination must be an absolute path');
  }
  const zipfile = await openZip(archivePath);
  try {
    const state = createArchiveState();
    const entries = await collectEntries(zipfile, state, limits, label);
    if (onPreflight) {
      await onPreflight({
        entryCount: state.entryCount,
        totalUncompressedSize: state.totalUncompressedSize,
      });
    }
    await fsp.mkdir(destination, { mode: 0o700 });
    const root = await fsp.realpath(destination);
    const rootStat = await fsp.lstat(root);
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
      throw archiveError(label, 'destination is not a safe directory');
    }

    for (const item of entries) {
      const segments = item.entryPath.split('/');
      if (item.isDirectory) {
        await ensureSafeDirectory(root, segments, label);
      } else {
        await extractFile(root, item, zipfile, state, limits, label);
      }
    }
  } finally {
    try {
      zipfile.close();
    } catch {
      // The ZIP reader may already have closed after a malformed archive.
    }
  }
}

module.exports = {
  createArchiveState,
  extractSafeZip,
  validateZipEntry,
};
