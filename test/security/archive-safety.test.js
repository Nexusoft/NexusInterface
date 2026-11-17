'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  createArchiveState,
  extractSafeZip,
  validateZipEntry,
} = require('../../src/main/ipc/safeZip');

const ARCHIVE_LIMITS = Object.freeze({
  maxCompressionRatio: 100,
  maxEntries: 2,
  maxEntryBytes: 1024,
  maxExpandedBytes: 1536,
});

function archiveEntry(overrides = {}) {
  return {
    compressedSize: 10,
    externalFileAttributes: 0o100644 << 16,
    fileName: 'db/data.dat',
    isEncrypted: () => false,
    uncompressedSize: 100,
    ...overrides,
  };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createStoredZip(entries) {
  const localEntries = [];
  const centralEntries = [];
  let offset = 0;

  for (const { fileName, contents, mode = 0o100644 } of entries) {
    const name = Buffer.from(fileName);
    const data = Buffer.from(contents);
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE((mode << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);

    localEntries.push(local, name, data);
    centralEntries.push(central, name);
    offset += local.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralEntries);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localEntries, centralDirectory, end]);
}

test('archive validation rejects traversal, links, bombs, and encrypted entries', () => {
  const rejectedEntries = [
    archiveEntry({ fileName: '../outside' }),
    archiveEntry({ fileName: 'db/../../outside' }),
    archiveEntry({ fileName: 'db\\outside' }),
    archiveEntry({ fileName: '/outside' }),
    archiveEntry({ fileName: 'C:\\outside' }),
    archiveEntry({ fileName: `db/${'a'.repeat(1025)}` }),
    archiveEntry({ externalFileAttributes: 0o120777 << 16 }),
    archiveEntry({ isEncrypted: () => true }),
    archiveEntry({ compressedSize: 1, uncompressedSize: 101 }),
    archiveEntry({ uncompressedSize: 2048 }),
  ];

  for (const entry of rejectedEntries) {
    assert.throws(
      () => validateZipEntry(entry, createArchiveState(), ARCHIVE_LIMITS),
      /Archive/
    );
  }

  const state = createArchiveState();
  validateZipEntry(archiveEntry(), state, ARCHIVE_LIMITS);
  assert.throws(
    () => validateZipEntry(archiveEntry(), state, ARCHIVE_LIMITS),
    /duplicate/
  );
  assert.throws(
    () =>
      validateZipEntry(
        archiveEntry({ fileName: 'db/other.dat', uncompressedSize: 1500 }),
        createArchiveState(),
        ARCHIVE_LIMITS
      ),
    /entry exceeds/
  );
});

test('safe ZIP extraction validates all paths before creating its destination', async () => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'nexus-safe-zip-')
  );
  const archivePath = path.join(temporaryDirectory, 'archive.zip');
  const destination = path.join(temporaryDirectory, 'extracted');
  try {
    await fs.writeFile(
      archivePath,
      createStoredZip([{ fileName: '../outside', contents: 'unsafe' }])
    );
    await assert.rejects(
      extractSafeZip({
        archivePath,
        destination,
        limits: ARCHIVE_LIMITS,
      })
    );
    await assert.rejects(fs.stat(destination), { code: 'ENOENT' });
    await assert.rejects(
      fs.stat(path.join(temporaryDirectory, 'outside')),
      { code: 'ENOENT' }
    );

    await fs.writeFile(
      archivePath,
      createStoredZip([{ fileName: 'db/data.txt', contents: 'safe' }])
    );
    const blockedDestination = path.join(temporaryDirectory, 'blocked');
    await assert.rejects(
      extractSafeZip({
        archivePath,
        destination: blockedDestination,
        limits: ARCHIVE_LIMITS,
        onPreflight: () => {
          throw new Error('insufficient extraction space');
        },
      }),
      /insufficient extraction space/
    );
    await assert.rejects(fs.stat(blockedDestination), { code: 'ENOENT' });

    let preflight;
    await extractSafeZip({
      archivePath,
      destination,
      limits: ARCHIVE_LIMITS,
      onPreflight: (metadata) => {
        preflight = metadata;
      },
    });
    assert.deepEqual(preflight, {
      entryCount: 1,
      totalUncompressedSize: 4,
    });
    assert.equal(
      await fs.readFile(path.join(destination, 'db', 'data.txt'), 'utf8'),
      'safe'
    );
  } finally {
    await fs.rm(temporaryDirectory, { force: true, recursive: true });
  }
});
