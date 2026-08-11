import checkDiskSpace from 'check-disk-space';
import crypto from 'crypto';
import fs from 'fs';
import https from 'https';
import path from 'path';

import {
  coreBinaryExists,
  startConfiguredCore,
  stopEmbeddedCore,
} from './core';
import { extractSafeZip } from './ipc/safeZip';
import { loadSettingsFromFile } from './settings';

const BOOTSTRAP_URL = 'https://bootstrap.nexus.io/tritium.zip';
const MAX_ARCHIVE_SIZE = 50 * 1000 * 1000 * 1000;
const MAX_BOOTSTRAP_ARCHIVE_ENTRIES = 100000;
const MAX_BOOTSTRAP_ARCHIVE_ENTRY_BYTES = 50 * 1000 * 1000 * 1000;
const MAX_BOOTSTRAP_ARCHIVE_EXPANDED_BYTES = 50 * 1000 * 1000 * 1000;
const MAX_BOOTSTRAP_ARCHIVE_COMPRESSION_RATIO = 100;
const MIN_FREE_SPACE = 15 * 1000 * 1000 * 1000;
const BOOTSTRAP_ARCHIVE_LIMITS = Object.freeze({
  maxCompressionRatio: MAX_BOOTSTRAP_ARCHIVE_COMPRESSION_RATIO,
  maxEntries: MAX_BOOTSTRAP_ARCHIVE_ENTRIES,
  maxEntryBytes: MAX_BOOTSTRAP_ARCHIVE_ENTRY_BYTES,
  maxExpandedBytes: MAX_BOOTSTRAP_ARCHIVE_EXPANDED_BYTES,
});

let activeBootstrap;

function emitStatus(send, step, details) {
  send({ step, details });
}

async function moveFile(source, destination) {
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  try {
    await fs.promises.rename(source, destination);
  } catch (error) {
    if (error?.code !== 'EXDEV') throw error;
    await fs.promises.copyFile(source, destination);
    await fs.promises.unlink(source);
  }
}

async function moveDirectoryContents(source, destination) {
  const entries = await fs.promises.readdir(source, { withFileTypes: true });
  await fs.promises.mkdir(destination, { recursive: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await moveDirectoryContents(sourcePath, destinationPath);
      await fs.promises.rm(sourcePath, { recursive: true, force: true });
    } else if (entry.isFile()) {
      await moveFile(sourcePath, destinationPath);
    }
  }
}

function downloadArchive(archivePath, onProgress, availableSpace) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (error) => {
      if (settled) return;
      settled = true;
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    const request = https.get(BOOTSTRAP_URL, (response) => {
      if (
        !response.statusCode ||
        response.statusCode < 200 ||
        response.statusCode >= 300
      ) {
        response.resume();
        settle(new Error(`Bootstrap server returned ${response.statusCode}`));
        return;
      }
      const totalSize = Number(response.headers['content-length']);
      if (Number.isFinite(totalSize) && totalSize > MAX_ARCHIVE_SIZE) {
        response.resume();
        settle(new Error('Bootstrap archive is too large'));
        return;
      }
      if (Number.isFinite(totalSize) && totalSize > availableSpace) {
        response.resume();
        settle(new Error('Bootstrap archive exceeds the available disk space'));
        return;
      }

      const archive = fs.createWriteStream(archivePath, {
        flags: 'wx',
        mode: 0o600,
      });
      let downloaded = 0;
      const fail = (error) => {
        settle(error);
        response.destroy();
        archive.destroy();
      };

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (downloaded > MAX_ARCHIVE_SIZE) {
          fail(new Error('Bootstrap archive is too large'));
          return;
        }
        if (downloaded > availableSpace) {
          fail(new Error('Bootstrap archive exceeds the available disk space'));
          return;
        }
        onProgress({
          downloaded,
          totalSize: Number.isFinite(totalSize) ? totalSize : undefined,
        });
      });
      response.once('error', fail);
      archive.once('error', fail);
      archive.once('finish', () => {
        settle();
      });
      response.pipe(archive);
    });
    request.setTimeout(180000, () =>
      request.destroy(new Error('Bootstrap request timed out'))
    );
    request.once('error', settle);
    activeBootstrap.request = request;
  });
}

async function extractBootstrapArchive(archivePath, extractDir, onPreflight) {
  await extractSafeZip({
    archivePath,
    destination: extractDir,
    label: 'Bootstrap archive',
    limits: BOOTSTRAP_ARCHIVE_LIMITS,
    onPreflight,
  });
}

export function abortBootstrap() {
  if (activeBootstrap) {
    activeBootstrap.aborted = true;
    activeBootstrap.request?.destroy();
  }
}

export async function startBootstrap(sendStatus) {
  if (activeBootstrap) throw new Error('Bootstrap is already running');
  const settings = loadSettingsFromFile();
  if (settings.manualDaemon) {
    throw new Error('Bootstrap is unavailable for a manually configured Core');
  }
  const extractDir = path.join(settings.coreDataDir, 'recent');
  const archivePath = path.join(
    settings.coreDataDir,
    `.bootstrap-${crypto.randomUUID()}.zip`
  );
  activeBootstrap = { aborted: false, request: undefined };

  let shouldRestartCore = false;
  try {
    await fs.promises.mkdir(settings.coreDataDir, { recursive: true });
    const diskSpace = await checkDiskSpace(settings.coreDataDir);
    if (diskSpace.free < MIN_FREE_SPACE) {
      throw new Error('At least 15GB of free space is required for bootstrap');
    }

    emitStatus(sendStatus, 'preparing');
    await fs.promises.rm(extractDir, { recursive: true, force: true });
    await fs.promises.rm(archivePath, { force: true });
    emitStatus(sendStatus, 'stopping_core');
    await stopEmbeddedCore();
    shouldRestartCore = true;
    if (activeBootstrap.aborted) return { aborted: true };

    emitStatus(sendStatus, 'downloading', { downloaded: 0 });
    await downloadArchive(
      archivePath,
      (details) => emitStatus(sendStatus, 'downloading', details),
      diskSpace.free
    );
    if (activeBootstrap.aborted) return { aborted: true };

    emitStatus(sendStatus, 'extracting');
    await extractBootstrapArchive(archivePath, extractDir, async (archive) => {
      const availableSpace = await checkDiskSpace(settings.coreDataDir);
      if (availableSpace.free < archive.totalUncompressedSize) {
        throw new Error(
          'Bootstrap archive requires more free space for extraction'
        );
      }
    });
    if (activeBootstrap.aborted) return { aborted: true };

    emitStatus(sendStatus, 'moving_db');
    await moveDirectoryContents(extractDir, settings.coreDataDir);
    if (activeBootstrap.aborted) return { aborted: true };

    emitStatus(sendStatus, 'restarting_core');
    if (coreBinaryExists()) {
      await startConfiguredCore();
      shouldRestartCore = false;
    }
    emitStatus(sendStatus, 'cleaning_up');
    return { aborted: false };
  } catch (error) {
    if (activeBootstrap?.aborted) return { aborted: true };
    throw error;
  } finally {
    await Promise.all([
      fs.promises.rm(extractDir, { recursive: true, force: true }),
      fs.promises.rm(archivePath, { force: true }),
    ]).catch(() => {});
    if (shouldRestartCore && coreBinaryExists()) {
      try {
        await startConfiguredCore();
      } catch {
        // Preserve the bootstrap error; the renderer will surface it.
      }
    }
    activeBootstrap = undefined;
    emitStatus(sendStatus, 'idle');
  }
}

export const bootstrapConstants = Object.freeze({
  BOOTSTRAP_URL,
  MIN_FREE_SPACE,
  MAX_ARCHIVE_SIZE,
  MAX_BOOTSTRAP_ARCHIVE_ENTRIES,
  MAX_BOOTSTRAP_ARCHIVE_ENTRY_BYTES,
  MAX_BOOTSTRAP_ARCHIVE_EXPANDED_BYTES,
  MAX_BOOTSTRAP_ARCHIVE_COMPRESSION_RATIO,
});
