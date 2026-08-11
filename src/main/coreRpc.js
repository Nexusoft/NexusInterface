import fs from 'fs/promises';
import http from 'http';
import https from 'https';
import path from 'path';
import crypto from 'crypto';

import { loadSettingsFromFile } from './settings';
import {
  getCoreTransportOptions,
  validateCoreRpcPath,
} from './ipc/coreTransport';
import {
  fromKeyValues,
  parseBooleanFlag,
  resolveEmbeddedCoreConnection,
  toKeyValues,
} from './ipc/coreConf';

let cachedEmbeddedConfig;
let embeddedConfigLoadPromise;

/**
 * Build the connection config the wallet will use, matching historical
 * NexusInterface behavior:
 * - credentials always come from nexus.conf (created if missing)
 * - SSL/port preferences from wallet settings overlay conf values so the GUI
 *   and the Core process it launches stay aligned
 */
async function loadEmbeddedConfig(settings) {
  if (cachedEmbeddedConfig) return cachedEmbeddedConfig;
  if (embeddedConfigLoadPromise) return embeddedConfigLoadPromise;

  embeddedConfigLoadPromise = (async () => {
    await fs.mkdir(settings.coreDataDir, { recursive: true });
    const configPath = path.join(settings.coreDataDir, 'nexus.conf');
    let config = {};
    try {
      config = fromKeyValues(await fs.readFile(configPath, 'utf8'));
    } catch {
      // A first launch creates the configuration below.
    }

    const resolved = resolveEmbeddedCoreConnection(config, {
      embeddedCoreUseNonSSL: settings.embeddedCoreUseNonSSL,
      embeddedCoreApiPort: settings.embeddedCoreApiPort,
      embeddedCoreApiPortSSL: settings.embeddedCoreApiPortSSL,
      generatedApiPassword: crypto.randomBytes(32).toString('hex'),
    });

    if (resolved.changed) {
      await fs.writeFile(configPath, toKeyValues(resolved.conf), {
        encoding: 'utf8',
        mode: 0o600,
      });
      console.info('core.config.written', {
        configPath,
        ...summarizeConfig(resolved.connection),
      });
    }

    cachedEmbeddedConfig = resolved.connection;
    console.info('core.config.resolved', {
      mode: 'embedded',
      configPath,
      ...summarizeConfig(resolved.connection),
    });
    return cachedEmbeddedConfig;
  })();

  try {
    return await embeddedConfigLoadPromise;
  } finally {
    // Clear the in-flight promise so a failed load can be retried on the next
    // call. Successful loads are still short-circuited by cachedEmbeddedConfig.
    embeddedConfigLoadPromise = undefined;
  }
}

export function clearCoreConfigCache() {
  cachedEmbeddedConfig = undefined;
  embeddedConfigLoadPromise = undefined;
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
  return loadEmbeddedConfig(settings);
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
    const fail = (error) => {
      // Probe/wait loops can fail many times while Core is still binding; keep
      // transport failure logs for non-probe callers (callCoreRpc).
      if (endpoint !== 'system/get/info' || timeout > 2500) {
        const code = error?.code || error?.errno;
        const message = error?.message || String(error);
        console.warn('core.rpc.request.failed', {
          endpoint,
          method,
          target: `${config.ip}:${port}`,
          apiSSL: !!apiSSL,
          timeout,
          statusCode: error?.statusCode,
          code,
          message,
        });
      }
      // Build an enriched error that exposes the safe endpoint context (no
      // credentials) so the renderer can show a useful diagnostic message.
      const safeMessage = error?.message || String(error);
      const enriched = new Error(`${endpointDesc}: ${safeMessage}`);
      // Preserve metadata so callers can distinguish ECONNREFUSED, timeout,
      // HTTP status errors, auth failures, and malformed JSON.
      if (error?.code !== undefined) enriched.code = error.code;
      if (error?.statusCode !== undefined) enriched.statusCode = error.statusCode;
      if (error?.errno !== undefined) enriched.errno = error.errno;
      reject(enriched);
    };

    const request = client.request(options, (response) => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        let parsed;
        try {
          parsed = data ? JSON.parse(data) : undefined;
        } catch {
          fail(new Error('Core response is not valid JSON'));
          return;
        }
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
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
    request.once('timeout', () =>
      request.destroy(new Error('Core request timed out'))
    );
    request.once('error', fail);
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
