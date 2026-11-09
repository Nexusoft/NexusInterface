'use strict';

const { execFile } = require('child_process');
const fs = require('fs/promises');
const { promisify } = require('util');

const execute = promisify(execFile);
const loopbackListeners = new Set([
  '127.0.0.1',
  '0.0.0.0',
  '::',
  '::ffff:127.0.0.1',
]);

async function linuxOwnsPort(pid, port) {
  const tables = await Promise.all(
    ['tcp', 'tcp6'].map(async (table) => {
      try {
        return await fs.readFile(`/proc/net/${table}`, 'utf8');
      } catch (error) {
        if (table === 'tcp6' && error.code === 'ENOENT') return '';
        throw error;
      }
    })
  );
  const addresses = new Set([
    '0100007F',
    '00000000',
    '00000000000000000000000000000000',
    '0000000000000000FFFF00000100007F',
  ]);
  const inodes = tables.flatMap((table) =>
    table.split('\n').flatMap((line) => {
      const fields = line.trim().split(/\s+/);
      const [address, localPort] = (fields[1] || '').split(':');
      return fields[3] === '0A' &&
        Number.parseInt(localPort, 16) === port &&
        addresses.has(address)
        ? [fields[9]]
        : [];
    })
  );
  if (!inodes.length) return false;

  const descriptors = await fs.readdir(`/proc/${pid}/fd`);
  const sockets = new Set(
    await Promise.all(descriptors.map(async (descriptor) => {
      try {
        return await fs.readlink(`/proc/${pid}/fd/${descriptor}`);
      } catch (error) {
        // A descriptor may close between readdir and readlink.
        if (error.code === 'ENOENT') return '';
        throw error;
      }
    }))
  );
  return inodes.every((inode) => sockets.has(`socket:[${inode}]`));
}

async function isCoreApiOwnedByProcess(configuration, pid) {
  if (configuration.ip !== '127.0.0.1' || !Number.isInteger(pid) || pid < 2) {
    return false;
  }
  const port = Number(configuration.apiSSL !== false
    ? configuration.apiPortSSL
    : configuration.apiPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return false;

  try {
    if (process.platform === 'linux') return await linuxOwnsPort(pid, port);

    if (process.platform === 'win32') {
      const { stdout } = await execute('powershell.exe', [
        '-NoProfile', '-NonInteractive', '-Command',
        'Get-NetTCPConnection -State Listen -LocalPort ([int]$env:NEXUS_CORE_API_PORT) -ErrorAction Stop | Select-Object LocalAddress,OwningProcess | ConvertTo-Json -Compress',
      ], {
        env: { ...process.env, NEXUS_CORE_API_PORT: String(port) },
        timeout: 5000,
      });
      const parsed = JSON.parse(stdout);
      const listeners = (Array.isArray(parsed) ? parsed : [parsed])
        .filter((listener) => loopbackListeners.has(listener.LocalAddress));
      return listeners.length > 0 &&
        listeners.every((listener) => listener.OwningProcess === pid);
    }

    if (process.platform === 'darwin') {
      const { stdout } = await execute('/usr/sbin/lsof', [
        '-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fpn',
      ], { timeout: 5000 });
      let owner;
      const owners = [];
      for (const line of stdout.split('\n')) {
        if (line.startsWith('p')) owner = Number(line.slice(1));
        if (line.startsWith('n')) {
          const address = line.slice(1, line.lastIndexOf(':'));
          if (address === '*' || loopbackListeners.has(address)) {
            owners.push(owner);
          }
        }
      }
      return owners.length > 0 && owners.every((ownerPid) => ownerPid === pid);
    }
    return false;
  } catch (error) {
    console.warn('core.api.ownership.failed', {
      pid,
      port,
      code: error.code,
      message: error.message,
    });
    return false;
  }
}

module.exports = { isCoreApiOwnedByProcess };
