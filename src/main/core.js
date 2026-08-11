import child_process from 'child_process';
import spawn from 'cross-spawn';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';

import { assetsByPlatformDir } from './paths';
import { loadSettingsFromFile, updateSettingsFile } from './settings';
import {
  callCoreRpc,
  clearCoreConfigCache,
  getCoreConfiguration,
  probeCoreApi,
} from './coreRpc';
import { assertAdvancedCoreParams } from './ipc/contracts';

// After killing a mismatched Core, wait briefly so OS listen sockets (API/P2P)
// are released before we spawn a replacement on the same ports.
const CORE_PORT_RELEASE_DELAY_MS = 750;
// Fresh Core processes need a moment before the local API accepts connections.
// Keep this short so renderer bootstrap is not blocked for a full-node cold
// start; coreInfoQuery continues polling after start returns.
const CORE_API_READY_TIMEOUT_MS = 15000;
const CORE_API_READY_POLL_MS = 500;
const CORE_STOP_GRACE_ATTEMPTS = 10;
const CORE_STOP_GRACE_DELAY_MS = 1000;

const coreBinaryName = `nexus-${process.platform}-${process.arch}${
  process.platform === 'win32' ? '.exe' : ''
}`;
const bundledCoreBinaryPath = path.join(
  assetsByPlatformDir,
  'cores',
  coreBinaryName
);
const coreBinaryOverrideEnv =
  process.env.NEXUS_CORE_BINARY_PATH || process.env.NEXUS_CORE_BINARY;
const windowsExecutableExtension = '.exe';
const windowsTasklistPidIndex = 1;

const execFile = (file, args, options = {}) =>
  new Promise((resolve, reject) => {
    child_process.execFile(file, args, options, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });

function normalizeConfiguredBinaryPath(configuredPath) {
  if (typeof configuredPath !== 'string') {
    return '';
  }

  let normalizedPath = configuredPath.trim();

  if (
    (normalizedPath.startsWith('"') && normalizedPath.endsWith('"')) ||
    (normalizedPath.startsWith("'") && normalizedPath.endsWith("'"))
  ) {
    normalizedPath = normalizedPath.slice(1, -1).trim();
  }

  const homePrefix = `~${path.sep}`;
  if (normalizedPath === '~' || normalizedPath.startsWith(homePrefix)) {
    const homeDir =
      process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
    if (homeDir) {
      normalizedPath =
        normalizedPath === '~'
          ? homeDir
          : path.join(homeDir, normalizedPath.slice(homePrefix.length));
    }
  }

  return normalizedPath ? path.normalize(normalizedPath) : '';
}

function getConfiguredCoreBinaryPath() {
  const settings = loadSettingsFromFile();
  const configuredPath =
    coreBinaryOverrideEnv || settings.embeddedCoreBinaryPath || '';

  return normalizeConfiguredBinaryPath(configuredPath) || bundledCoreBinaryPath;
}

function getCoreBinaryName(binaryPath = getConfiguredCoreBinaryPath()) {
  return path.basename(binaryPath);
}

function getCoreBinaryStatus() {
  const coreBinaryPath = getConfiguredCoreBinaryPath();
  const usingOverride = coreBinaryPath !== bundledCoreBinaryPath;
  const source = coreBinaryOverrideEnv
    ? 'environment'
    : usingOverride
    ? 'settings'
    : 'bundled assets';

  if (!path.isAbsolute(coreBinaryPath)) {
    return {
      exists: false,
      executable: false,
      path: coreBinaryPath,
      name: getCoreBinaryName(coreBinaryPath),
      source,
      error: `Nexus Core binary path must be absolute: ${coreBinaryPath}`,
    };
  }

  try {
    const stats = fs.statSync(coreBinaryPath);
    if (!stats.isFile()) {
      return {
        exists: true,
        executable: false,
        path: coreBinaryPath,
        name: getCoreBinaryName(coreBinaryPath),
        source,
        error: `Nexus Core binary path must point to a file: ${coreBinaryPath}`,
      };
    }

    if (
      process.platform === 'win32' &&
      path.extname(coreBinaryPath).toLowerCase() !== windowsExecutableExtension
    ) {
      return {
        exists: true,
        executable: false,
        path: coreBinaryPath,
        name: getCoreBinaryName(coreBinaryPath),
        source,
        error: `Nexus Core binary must be a .exe file on Windows: ${coreBinaryPath}`,
      };
    }

    fs.accessSync(
      coreBinaryPath,
      process.platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK
    );
    return {
      exists: true,
      executable: true,
      path: coreBinaryPath,
      name: getCoreBinaryName(coreBinaryPath),
      source,
    };
  } catch (err) {
    const error =
      err.code === 'ENOENT'
        ? usingOverride
          ? `Configured Nexus Core binary was not found: ${coreBinaryPath}`
          : `No bundled Nexus Core binary was found for ${process.platform}/${process.arch}. Expected: ${coreBinaryPath}. Set NEXUS_CORE_BINARY_PATH or Core Binary Path to use an external binary.`
        : process.platform === 'win32'
        ? `Nexus Core binary is not accessible: ${coreBinaryPath}`
        : `Nexus Core binary is not executable: ${coreBinaryPath}`;

    return {
      exists: false,
      executable: false,
      path: coreBinaryPath,
      name: getCoreBinaryName(coreBinaryPath),
      source,
      error,
    };
  }
}

function commandMatchesCore(
  command,
  normalizedCoreBinaryPath,
  resolvedCoreBinaryName
) {
  const normalizedCommand = path.normalize(command);
  const commandParts = splitCommandParts(command).map((part) =>
    path.normalize(part)
  );
  const possibleExecutableParts = commandParts.slice(0, 2);

  return (
    normalizedCommand === normalizedCoreBinaryPath ||
    normalizedCommand.startsWith(`${normalizedCoreBinaryPath} `) ||
    normalizedCommand.startsWith(`"${normalizedCoreBinaryPath}"`) ||
    normalizedCommand.includes(` ${normalizedCoreBinaryPath} `) ||
    normalizedCommand.includes(` "${normalizedCoreBinaryPath}"`) ||
    possibleExecutableParts.some((part) => {
      const unquotedPart = part.replace(/^(['"])(.*)\1$/, '$2');
      return path.basename(unquotedPart) === resolvedCoreBinaryName;
    })
  );
}

function splitCommandParts(command) {
  const parts = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;

  while ((match = pattern.exec(command)) !== null) {
    parts.push(match[1] ?? match[2] ?? match[3]);
  }

  return parts;
}

/**
 * True when a process command line targets the wallet's Core data directory.
 * Used to avoid killing an unrelated user-managed Core that shares the same
 * binary name/path but was started with a different -datadir=.
 */
function commandUsesDataDir(command, dataDir) {
  if (!command || !dataDir) {
    return false;
  }

  const normalizedDataDir = path.normalize(String(dataDir).trim());
  if (!normalizedDataDir) {
    return false;
  }

  return splitCommandParts(command).some((part) => {
    const match = /^[-/]datadir=(.+)$/i.exec(part);
    if (!match) {
      return false;
    }
    const value = match[1].replace(/^(['"])(.*)\1$/, '$2');
    return path.normalize(value) === normalizedDataDir;
  });
}

function parseWindowsCSVLine(line) {
  const fields = [];
  let field = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      field += char;
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      fields.push(field);
      field = '';
    } else {
      field += char;
    }
  }

  fields.push(field);
  return fields;
}

function findCoreProcessesInProcessList(
  processList,
  coreBinaryPath,
  resolvedCoreBinaryName
) {
  const normalizedCoreBinaryPath = path.normalize(coreBinaryPath);
  return processList
    .toString()
    .split('\n')
    .map((output) => {
      const match = output.match(/^\s*(\d+)\s+(.+)$/);
      if (!match) return null;

      return {
        pid: Number(match[1]),
        command: match[2],
      };
    })
    .filter(
      (processInfo) =>
        processInfo &&
        processInfo.pid > 1 &&
        !Number.isNaN(processInfo.pid) &&
        commandMatchesCore(
          processInfo.command,
          normalizedCoreBinaryPath,
          resolvedCoreBinaryName
        )
    );
}

function getExecutableCoreBinary() {
  const status = getCoreBinaryStatus();
  if (!status.exists || !status.executable) {
    throw new Error(status.error);
  }
  return status;
}

/**
 * Check if core binary file exists
 *
 * @returns {boolean} Does the configured core binary exist and is it executable
 */
export function coreBinaryExists() {
  const status = getCoreBinaryStatus();
  log.info(`Checking if core binary exists: ${status.path} (${status.source})`);
  if (status.exists && status.executable) {
    log.info('Core binary exists');
    return true;
  }

  log.info(status.error);
  return false;
}

export function coreBinaryStatus() {
  return getCoreBinaryStatus();
}

/**
 * List running Core processes (pid + command line) for the configured binary.
 * Prefer command lines that include arguments so callers can match -datadir=.
 *
 * @returns {Promise<Array<{ pid: number, command: string }>>}
 */
async function listCoreProcesses() {
  const { path: coreBinaryPath, name: resolvedCoreBinaryName } =
    getExecutableCoreBinary();
  const modEnv = { ...process.env, Nexus_Daemon: resolvedCoreBinaryName };

  if (process.platform == 'win32') {
    // tasklist does not include argv; use Win32_Process so -datadir= is visible.
    // Pass the image name via env (not string interpolation) so a hostile
    // binary basename cannot break out of a PowerShell -Command string.
    try {
      const psEnv = {
        ...modEnv,
        NEXUS_CORE_IMAGE_NAME: resolvedCoreBinaryName,
      };
      const stdout = await execFile(
        'powershell.exe',
        [
          '-NoProfile',
          '-Command',
          "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq $env:NEXUS_CORE_IMAGE_NAME } | Select-Object ProcessId,CommandLine | ConvertTo-Csv -NoTypeInformation",
        ],
        { env: psEnv }
      );
      // execFile wrapper resolves with stdout text (string or Buffer).
      const lines = String(stdout)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        // Skip CSV header: "ProcessId","CommandLine"
        .slice(1);

      return lines
        .map((line) => {
          const fields = parseWindowsCSVLine(line);
          const pid = Number(fields[0]);
          const command = fields[1] || '';
          if (!pid || Number.isNaN(pid) || pid < 2) {
            return null;
          }
          return { pid, command };
        })
        .filter(Boolean);
    } catch (error) {
      // Fall back to tasklist (name/PID only) when CIM is unavailable.
      log.info(
        `Core Manager: Unable to read Core command lines on Windows (${
          error?.message || error
        }); falling back to tasklist`
      );
      const taskList = await execFile(
        'tasklist',
        ['/NH', '/v', '/fo', 'CSV'],
        { env: modEnv }
      );
      return String(taskList)
        .split('\n')
        .map((output) => {
          if (!output.includes(`"${resolvedCoreBinaryName}"`)) {
            return null;
          }
          const fields = parseWindowsCSVLine(output);
          // tasklist CSV fields are "Image Name","PID",... so PID is column index 1.
          const pid =
            fields.length > windowsTasklistPidIndex
              ? Number(fields[windowsTasklistPidIndex])
              : null;
          if (!pid || Number.isNaN(pid) || pid < 2) {
            return null;
          }
          // No argv available — callers that require -datadir= will skip these.
          return { pid, command: resolvedCoreBinaryName };
        })
        .filter(Boolean);
    }
  }

  return findCoreProcessesInProcessList(
    await execFile(
      'ps',
      process.platform == 'darwin'
        ? ['-axo', 'pid=,comm=,args=']
        : ['-eo', 'pid=,comm=,args='],
      { env: modEnv }
    ),
    coreBinaryPath,
    resolvedCoreBinaryName
  );
}

/**
 * Get Process ID of core process if core is running.
 *
 * When `dataDir` is provided, only a process whose command line includes
 * `-datadir=<dataDir>` is returned. Kill/restart paths MUST pass dataDir so an
 * unrelated user-managed Core that merely shares the same binary name is never
 * targeted.
 *
 * When `dataDir` is omitted, the first matching binary is returned. That mode is
 * detection-only (e.g. isCoreRunning) and must not be used to decide what to kill.
 *
 * @param {{ dataDir?: string|null }} [options]
 * @returns {Promise<number|null>} PID
 * @memberof Core
 */
async function getCorePID({ dataDir = null } = {}) {
  const processes = await listCoreProcesses();
  const match = dataDir
    ? processes.find((processInfo) =>
        commandUsesDataDir(processInfo.command, dataDir)
      )
    : processes[0];

  if (!match || !match.pid || Number.isNaN(match.pid) || match.pid < 2) {
    return null;
  }
  return match.pid;
}

/**
 * Returns true if any Core binary process is found (detection only).
 * Does not imply the process is wallet-managed; kill paths use dataDir matching.
 * @returns { boolean } If the core is running.
 * @memberof Core
 */
export async function isCoreRunning() {
  const pid = await getCorePID();
  return !!pid;
}

/**
 * Start up the core with necessary parameters
 *
 * @memberof Core
 */
export function startCore(params) {
  const { path: coreBinaryPath } = getExecutableCoreBinary();
  // Never log raw API credentials from the parameter list.
  const redactedParams = (params || []).map((param) =>
    /^-api(user|password)=/i.test(param)
      ? `${param.slice(0, param.indexOf('=') + 1)}********`
      : param
  );
  log.info('Core Parameters: ' + redactedParams.join(' '));
  log.info('Core Manager: Starting core: ' + coreBinaryPath);
  try {
    const coreProcess = spawn(coreBinaryPath, params, {
      shell: false,
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    if (coreProcess) {
      // Detach fully so the wallet can exit without waiting on Core.
      coreProcess.unref();
      log.info(
        `Core Manager: Core has started (process id: ${coreProcess.pid})`
      );
      return coreProcess.pid;
    } else {
      throw 'Core failed to start';
    }

  } catch (err) {
    console.error(err);
    throw err;
  }
}

function buildConfiguredCoreParams(settings, configuration) {
  const lockedTestnet =
    typeof LOCK_TESTNET === 'undefined' ? '' : String(LOCK_TESTNET);
  const version = typeof APP_VERSION === 'undefined' ? '' : String(APP_VERSION);
  const preRelease =
    version.includes('alpha') || version.includes('beta') || !!lockedTestnet;
  const apiSSL = configuration.apiSSL !== false;

  // Pass non-secret API bind settings on the CLI. API credentials must NOT be
  // passed as -apiuser/-apipassword here: process listings (ps, Task Manager)
  // would leak them. Credentials are persisted to nexus.conf with mode 0600 by
  // resolveEmbeddedCoreConnection / getCoreConfiguration before spawn.
  // Core disables the API entirely when apiuser/apipassword are missing from
  // conf, and defaults the SSL API port to 8443 unless apisslport is set —
  // both of which leave the GUI stuck on "Connecting to Nexus Core..." while
  // P2P still works.
  const params = [
    '-daemon',
    '-server',
    '-fastsync',
    '-noterminateauth',
    '-ssl=1',
    `-apissl=${apiSSL ? '1' : '0'}`,
    '-p2pssl=1',
    `-datadir=${settings.coreDataDir}`,
    `-apisslport=${configuration.apiPortSSL}`,
    `-apiport=${configuration.apiPort}`,
    `-verbose=${preRelease ? 3 : settings.verboseLevel}`,
  ];

  if (lockedTestnet) {
    params.push(
      '-connect=testnet1.interactions-nexus.io',
      '-connect=testnet2.interactions-nexus.io',
      '-connect=testnet3.interactions-nexus.io',
      '-nodns=1',
      `-testnet=${lockedTestnet}`
    );
  } else if (
    settings.testnetIteration &&
    String(settings.testnetIteration) !== '0'
  ) {
    params.push(`-testnet=${settings.testnetIteration}`);
    if (settings.privateTestnet) params.push('-private=1');
  }

  if (settings.revertBlocks) {
    params.push(`-revertblocks=${settings.revertBlocks}`);
    updateSettingsFile({ revertBlocks: 0 });
  }
  if (settings.safeMode) params.push('-safemode=1');
  if (settings.walletClean) {
    params.push('-walletclean');
    updateSettingsFile({ walletClean: false });
  }
  if (!settings.avatarMode) params.push('-avatar=0');
  if (settings.enableMining) {
    params.push('-mining=1');
    if (settings.ipMineWhitelist) {
      for (const ip of settings.ipMineWhitelist.split(';')) {
        if (ip) params.push(`-llpallowip=${ip}`);
      }
    }
  }
  if (settings.enableStaking) params.push('-stake=1');
  if (settings.pooledStaking) params.push('-poolstaking=1');
  if (settings.liteMode) params.push('-client=1');
  if (settings.multiUser) params.push('-multiusername=1');
  if (settings.allowAdvancedCoreOptions && settings.advancedCoreParams) {
    // Re-validate at spawn time so a tampered settings.json cannot inject
    // wallet-managed flags (datadir/api creds/etc.).
    const safeParams = assertAdvancedCoreParams(settings.advancedCoreParams);
    if (safeParams) {
      params.push(...splitCommandParts(safeParams));
    }
  }

  return { params, lockedTestnet };
}

async function waitForCoreApi(configuration, {
  timeoutMs = CORE_API_READY_TIMEOUT_MS,
  pollMs = CORE_API_READY_POLL_MS,
} = {}) {
  const startedAt = Date.now();
  let lastError = 'API not ready';
  let attempts = 0;
  log.info('core.api.wait.begin', {
    timeoutMs,
    pollMs,
    target: `${configuration.ip}:${
      configuration.apiSSL !== false
        ? configuration.apiPortSSL
        : configuration.apiPort
    }`,
  });
  while (Date.now() - startedAt < timeoutMs) {
    attempts += 1;
    const probe = await probeCoreApi(configuration, {
      timeout: Math.min(pollMs, 2500),
      // Avoid spamming probe logs on every 500ms poll; final timeout logs below.
      log: attempts === 1,
    });
    if (probe.ok) {
      log.info('core.api.wait.ready', { attempts, elapsedMs: Date.now() - startedAt });
      return { ok: true, probe };
    }
    lastError = probe.error || lastError;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  log.warn('core.api.wait.timeout', { attempts, error: lastError, timeoutMs });
  return { ok: false, error: lastError };
}

/**
 * Gracefully stop embedded Core via API, then force-kill if it stays up.
 * Safe when the API is unreachable (kill path still runs).
 */
export async function stopEmbeddedCore() {
  const settings = loadSettingsFromFile();
  if (settings.manualDaemon) {
    return { stopped: false, reason: 'manual-daemon' };
  }

  if (!(await isCoreRunning())) {
    return { stopped: true, reason: 'not-running' };
  }

  try {
    // Keep quit-path latency bounded; force-kill handles a stuck Core.
    await callCoreRpc({ endpoint: 'system/stop', timeout: 5000 });
  } catch (error) {
    log.info(
      `Core Manager: Graceful stop request failed (${
        error?.message || error
      }); will force-kill if still running`
    );
  }

  for (let attempt = 0; attempt < CORE_STOP_GRACE_ATTEMPTS; attempt += 1) {
    if (!(await isCoreRunning())) {
      log.info('Core Manager: Core stopped gracefully');
      return { stopped: true, reason: 'graceful' };
    }
    await new Promise((resolve) =>
      setTimeout(resolve, CORE_STOP_GRACE_DELAY_MS)
    );
  }

  if (await isCoreRunning()) {
    const killed = await killCoreProcess();
    return {
      stopped: killed,
      reason: killed ? 'killed' : 'kill-failed',
    };
  }

  return { stopped: true, reason: 'graceful' };
}

/**
 * Starts the bundled core using only settings persisted by the main process.
 * Renderer callers cannot supply executable paths or process arguments.
 *
 * If a Core process is already running, the wallet probes the local API with
 * the configured host/port/SSL/credentials. P2P alone is not enough — a Core
 * started with a different datadir, default SSL port 8443, or without API auth
 * will keep the GUI disconnected forever unless we recover here.
 */
export async function startConfiguredCore() {
  log.info('core.start.requested');
  const settings = loadSettingsFromFile();
  if (settings.manualDaemon) {
    log.info('core.start.skipped', { reason: 'manual-daemon' });
    return { started: false, reason: 'manual-daemon' };
  }

  const status = getCoreBinaryStatus();
  log.info('core.binary.resolved', {
    exists: !!status.exists,
    executable: !!status.executable,
    path: status.path,
    error: status.error,
  });
  if (!status.exists || !status.executable) {
    throw new Error(status.error || 'Nexus Core binary not found');
  }

  clearCoreConfigCache();
  const configuration = await getCoreConfiguration();
  log.info('core.config.resolved', {
    ip: configuration.ip,
    apiSSL: configuration.apiSSL !== false,
    apiPort: configuration.apiPort,
    apiPortSSL: configuration.apiPortSSL,
    hasAuth: !!(configuration.apiUser && configuration.apiPassword),
    coreDataDir: settings.coreDataDir,
  });
  if (!configuration.apiUser || !configuration.apiPassword) {
    throw new Error(
      'Nexus Core API credentials are missing from nexus.conf; cannot start API server'
    );
  }

  if (await isCoreRunning()) {
    const probe = await probeCoreApi(configuration);
    if (probe.ok) {
      log.info(
        `Core Manager: Existing Core API is reachable at ${configuration.ip}:${
          configuration.apiSSL ? configuration.apiPortSSL : configuration.apiPort
        } (${configuration.apiSSL ? 'ssl' : 'plain'})`
      );
      log.info('core.api.ready', { reason: 'already-running' });
      return { started: false, reason: 'already-running', apiReachable: true };
    }

    // getCorePID() without a datadir filter matches by binary name/path only.
    // Only kill + restart when the process is clearly this wallet's managed
    // instance (-datadir= matches). Otherwise we risk killing an unrelated
    // user-managed Core and potentially causing data loss.
    const managedPid = await getCorePID({ dataDir: settings.coreDataDir });
    if (!managedPid) {
      log.warn(
        `Core Manager: A Nexus Core process is running but is not managed by this wallet ` +
          `(no matching -datadir=${settings.coreDataDir}) and API is unreachable (${probe.error}). ` +
          'Refusing to kill an unrelated Core instance.'
      );
      log.warn('core.restart.unmanaged_refused', { error: probe.error });
      return {
        started: false,
        reason: 'unmanaged-core-api-unreachable',
        apiReachable: false,
        apiError: probe.error,
      };
    }

    log.warn(
      `Core Manager: Wallet-managed Core process is running but API is unreachable (${probe.error}). ` +
        'Restarting Core with wallet API settings so the GUI can connect.'
    );
    log.warn('core.restart.mismatched_api', {
      error: probe.error,
      pid: managedPid,
    });
    await killCoreProcess();
    await new Promise((resolve) =>
      setTimeout(resolve, CORE_PORT_RELEASE_DELAY_MS)
    );
  }

  const { params, lockedTestnet } = buildConfiguredCoreParams(
    settings,
    configuration
  );

  if (
    !lockedTestnet &&
    !settings.testnetIteration &&
    (!settings.coreAPIPolicy || settings.coreAPIPolicy < 1)
  ) {
    updateSettingsFile({ coreAPIPolicy: 1 });
    await fs.promises.rm(path.join(settings.coreDataDir, '_API'), {
      recursive: true,
      force: true,
    });
    // Lite mode keeps API state under datadir/client/_API.
    if (settings.liteMode) {
      await fs.promises.rm(path.join(settings.coreDataDir, 'client', '_API'), {
        recursive: true,
        force: true,
      });
    }
  }

  const pid = startCore(params);
  log.info('core.spawned', { pid, coreDataDir: settings.coreDataDir });
  const ready = await waitForCoreApi(configuration);
  if (!ready.ok) {
    log.warn(
      `Core Manager: Core process started (pid ${pid}) but API is not reachable yet (${ready.error}). ` +
        'The GUI will keep retrying system/get/info.'
    );
    log.warn('core.api.wait.timeout.spawn', {
      pid,
      error: ready.error,
      timeoutMs: CORE_API_READY_TIMEOUT_MS,
    });
  } else {
    log.info(
      `Core Manager: Core API is reachable at ${configuration.ip}:${
        configuration.apiSSL ? configuration.apiPortSSL : configuration.apiPort
      } (${configuration.apiSSL ? 'ssl' : 'plain'})`
    );
    log.info('core.api.ready', { pid });
  }
  return {
    started: true,
    pid,
    apiReachable: ready.ok,
    apiError: ready.ok ? undefined : ready.error,
  };
}

export async function resyncLiteDatabase() {
  const settings = loadSettingsFromFile();
  if (settings.manualDaemon || !settings.liteMode) {
    throw new Error('Lite database resync is only available for embedded lite mode');
  }
  await fs.promises.rm(path.join(settings.coreDataDir, 'client'), {
    recursive: true,
    force: true,
  });
  return { removed: true };
}

/**
 * Find the wallet-managed Core's PID and then kill the task.
 * Only processes started with this wallet's -datadir= are targeted so an
 * unrelated user-managed Core sharing the same binary is left alone.
 * @memberof Core
 */
export async function killCoreProcess() {
  const settings = loadSettingsFromFile();
  const corePID = await getCorePID({ dataDir: settings.coreDataDir });
  if (!corePID) {
    log.info(
      'Core Manager: No wallet-managed Nexus Core process found to kill'
    );
    return false;
  }

  log.info('Core Manager: Killing process ' + corePID);
  if (process.platform == 'win32') {
    await execFile('taskkill', ['/F', '/PID', String(corePID)]);
  } else {
    process.kill(corePID, 'SIGKILL');
  }
  return true;
}

/**
 * Execute either an API call  by using the shell to execute the core path plus a command.
 * @param {string} command API command to run
 * @returns {object} the result of the command
 * @memberof Core
 */
export async function executeCommand(command) {
  const { path: coreBinaryPath } = getExecutableCoreBinary();
  try {
    const args = splitCommandParts(command);
    if (!args.length) throw new Error('Core console command is empty');
    const result = await execFile(coreBinaryPath, ['-noapiauth', ...args]);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
