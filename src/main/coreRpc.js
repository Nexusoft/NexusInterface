import fs from 'fs/promises';
import { renameSync } from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import crypto from 'crypto';

import { loadSettingsFromFile } from './settings';
import {
  getCoreTransportOptions,
  validateCoreRpcPath,
} from './ipc/coreTransport';
import { redactSensitiveText } from './ipc/coreRpcRegistry';
import { createConfigOwner } from './ipc/configOwner';
import {
  fromKeyValues,
  parseBooleanFlag,
  resolveEmbeddedCoreConnection,
  updateKeyValues,
} from './ipc/coreConf';

/**
 * Build the connection config the wallet will use, matching historical
 * NexusInterface behavior:
 * - credentials always come from nexus.conf (created if missing)
 * - SSL/port preferences from wallet settings overlay conf values so the GUI
 *   and the Core process it launches stay aligned
 */
const embeddedConfigOwner = createConfigOwner(
  async (settings, assertCurrent) => {
    await fs.mkdir(settings.coreDataDir, { recursive: true });
    const configPath = path.join(settings.coreDataDir, 'nexus.conf');
    let contents = '';
    try {
      contents = await fs.readFile(configPath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    assertCurrent();

    const config = fromKeyValues(contents);
    const resolved = resolveEmbeddedCoreConnection(config, {
      embeddedCoreUseNonSSL: settings.embeddedCoreUseNonSSL,
      embeddedCoreApiPort: settings.embeddedCoreApiPort,
      embeddedCoreApiPortSSL: settings.embeddedCoreApiPortSSL,
      generatedApiPassword: crypto.randomBytes(32).toString('hex'),
    });

    if (resolved.changed) {
      const temporaryPath = `${configPath}.${crypto
        .randomBytes(16)
        .toString('hex')}.tmp`;
      let cleanupTemporary = true;
      try {
        try {
          await fs.writeFile(temporaryPath, updateKeyValues(contents, resolved.conf), {
            encoding: 'utf8',
            mode: 0o600,
            flag: 'wx',
          });
        } catch (error) {
          if (error.code === 'EEXIST') cleanupTemporary = false;
          throw error;
        }
        assertCurrent();
        renameSync(temporaryPath, configPath);
      } finally {
        if (cleanupTemporary) {
          try {
            await fs.unlink(temporaryPath);
          } catch (error) {
            if (error.code !== 'ENOENT') {
              console.warn('core.config.temp_cleanup.failed', {
                configPath,
                code: error.code,
              });
            }
          }
        }
      }
      assertCurrent();
      console.info('core.config.written', {
        configPath,
        ...summarizeConfig(resolved.connection),
      });
    }

    console.info('core.config.resolved', {
      mode: 'embedded',
      configPath,
      ...summarizeConfig(resolved.connection),
    });
    return resolved.connection;
  }
);

export function clearCoreConfigCache() {
  embeddedConfigOwner.invalidate();
}

function summarizeConfig(config) {
  if (!config) return null;
  return {
    ip: config.ip,
    apiSSL: !!config.apiSSL,
    apiPort: config.apiPort,
    apiPortSSL: config.apiPortSSL,
    hasAuth: !!(config.apiUser && config.apiPassword),
  };
}

export async function getCoreConfiguration() {
  const settings = loadSettingsFromFile();
  if (settings.manualDaemon) {
    return {
      ip: settings.manualDaemonIP || '127.0.0.1',
      apiSSL: parseBooleanFlag(settings.manualDaemonApiSSL, true),
      apiPort: String(settings.manualDaemonApiPort || '8080'),
      apiPortSSL: String(settings.manualDaemonApiPortSSL || '7080'),
      apiUser: settings.manualDaemonApiUser || 'apiserver',
      apiPassword: settings.manualDaemonApiPassword || '',
    };
  }
  return embeddedConfigOwner.get(settings);
}

export async function getPublicCoreConfiguration() {
  const config = await getCoreConfiguration();
  return {
    ip: config.ip,
    apiSSL: config.apiSSL,
    apiPort: config.apiPort,
    apiPortSSL: config.apiPortSSL,
    txExpiry: config.txExpiry,
  };
}

function requestCore({ method, endpoint, params, config, timeout = 30000 }) {
  const body = params === undefined ? undefined : JSON.stringify(params);
  const { apiSSL, rejectUnauthorized } = getCoreTransportOptions(config);
  const client = apiSSL ? https : http;
  const port = apiSSL ? config.apiPortSSL : config.apiPort;
  const options = {
    method,
    hostname: config.ip,
    port,
    path: `/${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
    },
    auth:
      config.apiUser && config.apiPassword
        ? `${config.apiUser}:${config.apiPassword}`
        : undefined,
    ...(apiSSL ? { rejectUnauthorized } : {}),
    timeout,
  };

  return new Promise((resolve, reject) => {
    const endpointDesc = `${apiSSL ? 'HTTPS' : 'HTTP'} ${config.ip}:${port}`;
    let settled = false;
    let responseStream;
    let deadline;
    const fail = (error, transportFailure = false) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      // Probe/wait loops can fail many times while Core is still binding; keep
      // transport failure logs for non-probe callers (callCoreRpc).
      if (endpoint !== 'system/get/info' || timeout > 2500) {
        const code = error?.code || error?.errno;
        const message = error?.message || String(error);
        console.warn('core.rpc.request.failed', {
          endpoint: redactSensitiveText(endpoint.split('?')[0]),
          method,
          target: `${config.ip}:${port}`,
          apiSSL: !!apiSSL,
          timeout,
          statusCode: error?.statusCode,
          code,
          message: redactSensitiveText(message),
        });
      }
      // Build an enriched error that exposes the safe endpoint context (no
      // credentials) so the renderer can show a useful diagnostic message.
      const safeMessage = error?.message || String(error);
      const pathSegments = endpoint.split('?')[0].split('/');
      const potentialMutation = ![
        'get',
        'list',
        'status',
        'transactions',
        'validate',
      ].includes(pathSegments[1]);
      const unknownOutcome = transportFailure && potentialMutation;
      const debit = pathSegments[0] === 'finance' && pathSegments[1] === 'debit';
      const enriched = new Error(unknownOutcome
        ? debit
          ? `Transaction outcome is unknown: Core may have submitted it. Check transaction history and balances before sending again. ${endpointDesc}: ${safeMessage}`
          : `Core operation outcome is unknown: Core may have completed it. Check its state before retrying. ${endpointDesc}: ${safeMessage}`
        : `${endpointDesc}: ${safeMessage}`);
      // Preserve metadata so callers can distinguish ECONNREFUSED, timeout,
      // HTTP status errors, auth failures, and malformed JSON.
      if (error?.code !== undefined) enriched.code = error.code;
      if (error?.statusCode !== undefined) enriched.statusCode = error.statusCode;
      if (error?.errno !== undefined) enriched.errno = error.errno;
      if (unknownOutcome) enriched.code = 'CORE_OUTCOME_UNKNOWN';
      reject(enriched);
    };

    const request = client.request(options, (response) => {
      responseStream = response;
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > 32 * 1024 * 1024) {
          const error = new Error('Core response exceeds the 32 MiB limit');
          fail(error, true);
          response.destroy();
          request.destroy();
          return;
        }
        chunks.push(chunk);
      });
      response.once('error', (error) => {
        fail(error, true);
        response.destroy();
        request.destroy();
      });
      response.once('aborted', () => fail(new Error('Core response was aborted'), true));
      response.once('close', () => {
        if (!response.complete) fail(new Error('Core response closed prematurely'), true);
      });
      response.on('end', () => {
        if (settled) return;
        let parsed;
        try {
          const data = Buffer.concat(chunks).toString('utf8');
          parsed = data ? JSON.parse(data) : undefined;
        } catch {
          fail(new Error('Core response is not valid JSON'), true);
          return;
        }
        if (parsed?.error) {
          const error = parsed.error;
          if (typeof error === 'object') error.statusCode = response.statusCode;
          fail(error);
        } else if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          if (/^finance\/debit\//.test(endpoint) && parsed?.result?.success === false) {
            fail(new Error('Core rejected the transaction'));
            return;
          }
          if (/^finance\/debit\//.test(endpoint) && parsed?.result?.success !== true) {
            fail(new Error('Core response did not confirm the transaction'), true);
            return;
          }
          settled = true;
          clearTimeout(deadline);
          resolve(parsed?.result);
        } else {
          const error =
            parsed?.error || new Error(`Core returned ${response.statusCode}`);
          if (error && typeof error === 'object') {
            error.statusCode = response.statusCode;
          }
          fail(error);
        }
      });
    });
    deadline = setTimeout(() => {
      const error = new Error('Core request deadline exceeded');
      fail(error, true);
      responseStream?.destroy();
      request.destroy();
    }, timeout);
    request.once('timeout', () =>
      request.destroy(new Error('Core request timed out'))
    );
    request.once('error', (error) => fail(error, true));
    if (body) request.write(body);
    request.end();
  });
}

/**
 * Probe whether the local Core API accepts the wallet's configured credentials
 * and port/SSL settings. Used when a Core process is already running so we do
 * not silently stick to a process that only has P2P up (or uses different
 * datadir/ports/auth).
 */
export async function probeCoreApi(
  config,
  { timeout = 2500, log = true } = {}
) {
  const resolved = config || (await getCoreConfiguration());
  if (log) {
    console.info('core.probe.begin', summarizeConfig(resolved));
  }
  try {
    const result = await requestCore({
      method: 'POST',
      endpoint: 'system/get/info',
      params: undefined,
      config: resolved,
      timeout,
    });
    if (log) {
      console.info('core.probe.ok', summarizeConfig(resolved));
    }
    return { ok: true, result, config: resolved };
  } catch (error) {
    const message = error?.message || String(error);
    if (log) {
      console.warn('core.probe.failed', {
        ...summarizeConfig(resolved),
        error: message,
        code: error?.code,
      });
    }
    return {
      ok: false,
      error: message,
      config: resolved,
    };
  }
}

export async function callCoreRpc({ endpoint, params, timeout }) {
  const config = await getCoreConfiguration();
  return requestCore({ method: 'POST', endpoint, params, config, timeout });
}

export async function terminateRemoteSessionsOnQuit() {
  const settings = loadSettingsFromFile();
  if (!settings.manualDaemon || !settings.manualDaemonLogOutOnClose) return;

  const info = await callCoreRpc({ endpoint: 'system/get/info', timeout: 5000 });
  if (typeof info?.multiuser !== 'boolean') {
    throw new Error('Core did not confirm its session mode; logout cancelled');
  }
  const sessions = info.multiuser
    ? await callCoreRpc({ endpoint: 'sessions/list/local', timeout: 5000 })
    : [null];
  if (
    !Array.isArray(sessions) ||
    (info.multiuser &&
      sessions.some((session) => typeof session?.session !== 'string'))
  ) {
    throw new Error('Core returned an invalid session list; logout cancelled');
  }
  await Promise.all(sessions.map(async (session) => {
    try {
      const result = await callCoreRpc({
        endpoint: 'sessions/terminate/local',
        params: session ? { session: session.session } : undefined,
        timeout: 5000,
      });
      if (result?.success !== true) {
        throw new Error('Core did not confirm session termination');
      }
    } catch (error) {
      // These responses explicitly mean there is no active session to end.
      if (error.code !== -11 && error.code !== -234) throw error;
    }
  }));
  return true;
}

export async function callCoreRpcByUrl(url) {
  const normalizedUrl = validateCoreRpcPath(url);
  const config = await getCoreConfiguration();
  return requestCore({
    method: 'GET',
    endpoint: normalizedUrl,
    params: undefined,
    config,
  });
}
