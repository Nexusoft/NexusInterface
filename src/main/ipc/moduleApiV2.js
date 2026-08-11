'use strict';

/**
 * Runtime contract for the isolated NEXUS module API (v2).
 * Pure validators — no Electron/Node privileged APIs — so tests can import it.
 */

const API_VERSION = 2;

const ERROR_CODES = Object.freeze({
  INVALID_REQUEST: 'module.invalid_request',
  UNKNOWN_METHOD: 'module.unknown_method',
  UNAUTHORIZED: 'module.unauthorized',
  CAPABILITY_DENIED: 'module.capability_denied',
  MODULE_DISABLED: 'module.disabled',
  MODULE_UNKNOWN: 'module.unknown',
  PAYLOAD_TOO_LARGE: 'module.payload_too_large',
  RATE_LIMITED: 'module.rate_limited',
  VALIDATION_FAILED: 'module.validation_failed',
  HOST_UNAVAILABLE: 'module.host_unavailable',
  INTERNAL: 'module.internal',
});

const CAPABILITIES = Object.freeze({
  WALLET_CONTEXT: 'wallet.context',
  UI_NOTIFY: 'ui.notify',
  UI_CONFIRM: 'ui.confirm',
  UI_OPEN_EXTERNAL: 'ui.openExternal',
  UI_COPY_TEXT: 'ui.copyText',
  STORAGE: 'storage',
  STATE: 'state',
  WALLET_REQUEST_SEND: 'wallet.requestSend',
  // Explicitly insecure; never granted to production modules.
  LEGACY_API: 'legacy.api',
});

const DEFAULT_CAPABILITIES = Object.freeze([
  CAPABILITIES.WALLET_CONTEXT,
  CAPABILITIES.UI_NOTIFY,
  CAPABILITIES.UI_CONFIRM,
  CAPABILITIES.UI_OPEN_EXTERNAL,
  CAPABILITIES.UI_COPY_TEXT,
  CAPABILITIES.STORAGE,
  CAPABILITIES.STATE,
  CAPABILITIES.WALLET_REQUEST_SEND,
]);

const METHODS = Object.freeze({
  WALLET_GET_CONTEXT: 'wallet.getContext',
  UI_NOTIFY: 'ui.notify',
  UI_CONFIRM: 'ui.confirm',
  UI_OPEN_EXTERNAL: 'ui.openExternal',
  UI_COPY_TEXT: 'ui.copyText',
  STORAGE_GET: 'storage.get',
  STORAGE_SET: 'storage.set',
  STATE_GET: 'state.get',
  STATE_SET: 'state.set',
  WALLET_REQUEST_SEND: 'wallet.requestSend',
});

const METHOD_CAPABILITY = Object.freeze({
  [METHODS.WALLET_GET_CONTEXT]: CAPABILITIES.WALLET_CONTEXT,
  [METHODS.UI_NOTIFY]: CAPABILITIES.UI_NOTIFY,
  [METHODS.UI_CONFIRM]: CAPABILITIES.UI_CONFIRM,
  [METHODS.UI_OPEN_EXTERNAL]: CAPABILITIES.UI_OPEN_EXTERNAL,
  [METHODS.UI_COPY_TEXT]: CAPABILITIES.UI_COPY_TEXT,
  [METHODS.STORAGE_GET]: CAPABILITIES.STORAGE,
  [METHODS.STORAGE_SET]: CAPABILITIES.STORAGE,
  [METHODS.STATE_GET]: CAPABILITIES.STATE,
  [METHODS.STATE_SET]: CAPABILITIES.STATE,
  [METHODS.WALLET_REQUEST_SEND]: CAPABILITIES.WALLET_REQUEST_SEND,
});

const CHANNELS = Object.freeze({
  invoke: 'module-api:invoke',
  hostRequest: 'module-api:host-request',
  hostResponse: 'module-api:host-response',
  contextChanged: 'module-api:context-changed',
  registerGuest: 'module-api:register-guest',
});

const MAX_STRING = 4096;
const MAX_URL = 2048;
const MAX_NOTIFY_CONTENT = 2000;
const MAX_CONFIRM_NOTE = 4000;
const MAX_STORAGE_JSON_BYTES = 1_000_000;
const MAX_STATE_JSON_BYTES = 256_000;
const MAX_COPY_TEXT = 100_000;
const MAX_RECIPIENTS = 25;
const MAX_NESTING = 8;

function fail(code, message) {
  const error = new TypeError(message);
  error.code = code;
  throw error;
}

function assertRecord(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(ERROR_CODES.VALIDATION_FAILED, `${name} must be an object`);
  }
  return value;
}

function assertString(value, name, { min = 0, max = MAX_STRING } = {}) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail(
      ERROR_CODES.VALIDATION_FAILED,
      `${name} must be a string between ${min} and ${max} characters`
    );
  }
  return value;
}

function assertBoolean(value, name) {
  if (typeof value !== 'boolean') {
    fail(ERROR_CODES.VALIDATION_FAILED, `${name} must be a boolean`);
  }
  return value;
}

function jsonSize(value) {
  try {
    return JSON.stringify(value).length;
  } catch {
    fail(ERROR_CODES.VALIDATION_FAILED, 'Value is not JSON-serializable');
  }
}

function assertNesting(value, depth = 0) {
  if (depth > MAX_NESTING) {
    fail(ERROR_CODES.VALIDATION_FAILED, 'Payload nesting is too deep');
  }
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) assertNesting(item, depth + 1);
    return;
  }
  for (const nested of Object.values(value)) assertNesting(nested, depth + 1);
}

function assertPlainJson(value, name, maxBytes) {
  assertRecord(value, name);
  assertNesting(value);
  const size = jsonSize(value);
  if (size > maxBytes) {
    fail(ERROR_CODES.PAYLOAD_TOO_LARGE, `${name} exceeds ${maxBytes} bytes`);
  }
  // Structured-clone / JSON only — reject functions etc. via round-trip.
  return JSON.parse(JSON.stringify(value));
}

function validateModuleOpenUrl(value, name = 'URL') {
  const raw = assertString(value, name, { min: 1, max: MAX_URL });
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    fail(ERROR_CODES.VALIDATION_FAILED, `${name} must be an absolute URL`);
  }
  const protocol = parsed.protocol.toLowerCase();
  if (
    protocol !== 'https:' &&
    protocol !== 'http:' &&
    protocol !== 'mailto:'
  ) {
    fail(ERROR_CODES.VALIDATION_FAILED, `${name} protocol is not allowed`);
  }
  if (protocol === 'mailto:') return parsed.toString();
  if (!parsed.hostname) {
    fail(ERROR_CODES.VALIDATION_FAILED, `${name} host is required`);
  }
  return parsed.toString();
}

function validateNotifyOptions(value) {
  const options = assertRecord(value || {}, 'Notify options');
  const allowed = new Set(['content', 'type', 'autoClose']);
  for (const key of Object.keys(options)) {
    if (!allowed.has(key)) {
      fail(ERROR_CODES.VALIDATION_FAILED, `Unknown notify option: ${key}`);
    }
  }
  const content = assertString(options.content ?? '', 'Notify content', {
    min: 0,
    max: MAX_NOTIFY_CONTENT,
  });
  let type;
  if (options.type !== undefined) {
    type = assertString(options.type, 'Notify type', { min: 1, max: 32 });
    if (!['info', 'success', 'error', 'warning', 'request'].includes(type)) {
      fail(ERROR_CODES.VALIDATION_FAILED, 'Notify type is invalid');
    }
  }
  let autoClose;
  if (options.autoClose !== undefined) {
    if (
      typeof options.autoClose !== 'boolean' &&
      !(
        typeof options.autoClose === 'number' &&
        Number.isFinite(options.autoClose) &&
        options.autoClose >= 0 &&
        options.autoClose <= 60000
      )
    ) {
      fail(ERROR_CODES.VALIDATION_FAILED, 'Notify autoClose is invalid');
    }
    autoClose = options.autoClose;
  }
  return { content, type, autoClose };
}

function validateConfirmOptions(value) {
  const options = assertRecord(value || {}, 'Confirm options');
  const allowed = new Set([
    'question',
    'note',
    'labelYes',
    'labelNo',
    'skinYes',
    'skinNo',
  ]);
  for (const key of Object.keys(options)) {
    if (!allowed.has(key)) {
      fail(ERROR_CODES.VALIDATION_FAILED, `Unknown confirm option: ${key}`);
    }
  }
  return {
    question: assertString(options.question ?? 'Confirm?', 'Confirm question', {
      min: 1,
      max: 500,
    }),
    note:
      options.note === undefined
        ? undefined
        : assertString(options.note, 'Confirm note', {
            min: 0,
            max: MAX_CONFIRM_NOTE,
          }),
    labelYes:
      options.labelYes === undefined
        ? undefined
        : assertString(options.labelYes, 'Confirm labelYes', {
            min: 1,
            max: 64,
          }),
    labelNo:
      options.labelNo === undefined
        ? undefined
        : assertString(options.labelNo, 'Confirm labelNo', {
            min: 1,
            max: 64,
          }),
    skinYes:
      options.skinYes === undefined
        ? undefined
        : assertString(options.skinYes, 'Confirm skinYes', {
            min: 1,
            max: 32,
          }),
    skinNo:
      options.skinNo === undefined
        ? undefined
        : assertString(options.skinNo, 'Confirm skinNo', { min: 1, max: 32 }),
  };
}

function validateSendDraft(value) {
  const draft = assertRecord(value || {}, 'Send draft');
  const allowed = new Set(['sendFrom', 'recipients', 'advancedOptions']);
  for (const key of Object.keys(draft)) {
    if (!allowed.has(key)) {
      fail(ERROR_CODES.VALIDATION_FAILED, `Unknown send draft field: ${key}`);
    }
  }
  if (!Array.isArray(draft.recipients) || !draft.recipients.length) {
    fail(ERROR_CODES.VALIDATION_FAILED, 'Send draft requires recipients');
  }
  if (draft.recipients.length > MAX_RECIPIENTS) {
    fail(ERROR_CODES.VALIDATION_FAILED, 'Too many recipients');
  }
  const recipients = draft.recipients.map((raw, index) => {
    const recipient = assertRecord(raw, `Recipient[${index}]`);
    const allowedRecipient = new Set([
      'address',
      'amount',
      'reference',
      'expireDays',
      'expireHours',
      'expireMinutes',
      'expireSeconds',
    ]);
    for (const key of Object.keys(recipient)) {
      if (!allowedRecipient.has(key)) {
        fail(
          ERROR_CODES.VALIDATION_FAILED,
          `Unknown recipient field: ${key}`
        );
      }
    }
    const address = assertString(recipient.address ?? '', 'Recipient address', {
      min: 1,
      max: 128,
    });
    let amount;
    if (recipient.amount !== undefined) {
      if (
        typeof recipient.amount !== 'string' &&
        typeof recipient.amount !== 'number'
      ) {
        fail(ERROR_CODES.VALIDATION_FAILED, 'Recipient amount is invalid');
      }
      amount = String(recipient.amount).slice(0, 64);
    }
    let reference;
    if (recipient.reference !== undefined) {
      if (
        typeof recipient.reference !== 'string' &&
        typeof recipient.reference !== 'number'
      ) {
        fail(ERROR_CODES.VALIDATION_FAILED, 'Recipient reference is invalid');
      }
      reference = String(recipient.reference).slice(0, 128);
    }
    const expiryField = (name) => {
      if (recipient[name] === undefined) return undefined;
      const n = Number(recipient[name]);
      if (!Number.isFinite(n) || n < 0 || n > 3650) {
        fail(ERROR_CODES.VALIDATION_FAILED, `Recipient ${name} is invalid`);
      }
      return n;
    };
    return {
      address,
      amount,
      reference,
      expireDays: expiryField('expireDays'),
      expireHours: expiryField('expireHours'),
      expireMinutes: expiryField('expireMinutes'),
      expireSeconds: expiryField('expireSeconds'),
    };
  });

  return {
    sendFrom:
      draft.sendFrom === undefined
        ? undefined
        : assertString(draft.sendFrom, 'sendFrom', { min: 1, max: 160 }),
    recipients,
    advancedOptions:
      draft.advancedOptions === undefined
        ? undefined
        : assertBoolean(draft.advancedOptions, 'advancedOptions'),
  };
}

function validateInvokeRequest(value) {
  const request = assertRecord(value, 'Module API request');
  const method = assertString(request.method, 'method', { min: 1, max: 64 });
  if (!METHOD_CAPABILITY[method]) {
    fail(ERROR_CODES.UNKNOWN_METHOD, `Unknown module API method: ${method}`);
  }
  if (request.requestId !== undefined) {
    assertString(request.requestId, 'requestId', { min: 1, max: 64 });
  }
  const payload = request.payload;
  let normalizedPayload;
  switch (method) {
    case METHODS.WALLET_GET_CONTEXT:
    case METHODS.STORAGE_GET:
    case METHODS.STATE_GET:
      if (payload !== undefined) {
        fail(ERROR_CODES.VALIDATION_FAILED, `${method} does not accept a payload`);
      }
      normalizedPayload = undefined;
      break;
    case METHODS.UI_NOTIFY:
      normalizedPayload = validateNotifyOptions(payload);
      break;
    case METHODS.UI_CONFIRM:
      normalizedPayload = validateConfirmOptions(payload);
      break;
    case METHODS.UI_OPEN_EXTERNAL:
      normalizedPayload = {
        url: validateModuleOpenUrl(
          payload && typeof payload === 'object' ? payload.url : payload,
          'External URL'
        ),
      };
      break;
    case METHODS.UI_COPY_TEXT:
      normalizedPayload = {
        text: assertString(
          payload && typeof payload === 'object' ? payload.text : payload,
          'Clipboard text',
          { min: 0, max: MAX_COPY_TEXT }
        ),
      };
      break;
    case METHODS.STORAGE_SET:
      normalizedPayload = {
        value: assertPlainJson(
          payload && typeof payload === 'object' && 'value' in payload
            ? payload.value
            : payload,
          'Storage value',
          MAX_STORAGE_JSON_BYTES
        ),
      };
      break;
    case METHODS.STATE_SET:
      normalizedPayload = {
        value: assertPlainJson(
          payload && typeof payload === 'object' && 'value' in payload
            ? payload.value
            : payload,
          'State value',
          MAX_STATE_JSON_BYTES
        ),
      };
      break;
    case METHODS.WALLET_REQUEST_SEND:
      normalizedPayload = validateSendDraft(payload);
      break;
    default:
      fail(ERROR_CODES.UNKNOWN_METHOD, `Unknown module API method: ${method}`);
  }
  return {
    method,
    payload: normalizedPayload,
    requestId: request.requestId,
  };
}

function normalizeManifestCapabilities(rawCapabilities, { development = false } = {}) {
  if (rawCapabilities === undefined || rawCapabilities === null) {
    return [...DEFAULT_CAPABILITIES];
  }
  if (!Array.isArray(rawCapabilities)) {
    fail(ERROR_CODES.VALIDATION_FAILED, 'Module capabilities must be an array');
  }
  if (rawCapabilities.length > 32) {
    fail(ERROR_CODES.VALIDATION_FAILED, 'Too many module capabilities');
  }
  const allowed = new Set(Object.values(CAPABILITIES));
  const normalized = [];
  for (const capability of rawCapabilities) {
    const value = assertString(capability, 'capability', { min: 1, max: 64 });
    if (!allowed.has(value)) {
      fail(ERROR_CODES.VALIDATION_FAILED, `Unknown capability: ${value}`);
    }
    if (value === CAPABILITIES.LEGACY_API && !development) {
      fail(
        ERROR_CODES.VALIDATION_FAILED,
        'legacy.api is only allowed for development modules'
      );
    }
    if (!normalized.includes(value)) normalized.push(value);
  }
  return normalized;
}

function sanitizeWalletContext(raw = {}) {
  const theme =
    raw.theme && typeof raw.theme === 'object' && !Array.isArray(raw.theme)
      ? JSON.parse(JSON.stringify(raw.theme))
      : null;

  const settingsSource =
    raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
  const settings = {
    locale:
      typeof settingsSource.locale === 'string'
        ? settingsSource.locale.slice(0, 16)
        : 'en',
    fiatCurrency:
      typeof settingsSource.fiatCurrency === 'string'
        ? settingsSource.fiatCurrency.slice(0, 8)
        : 'USD',
    addressStyle:
      typeof settingsSource.addressStyle === 'string'
        ? settingsSource.addressStyle.slice(0, 32)
        : 'segwit',
  };

  const coreInfo = raw.coreInfo && typeof raw.coreInfo === 'object' ? raw.coreInfo : {};
  const core = {
    connected: Boolean(coreInfo && (coreInfo.connections > 0 || coreInfo.synchronized || coreInfo.version)),
    synchronized: Boolean(coreInfo?.synchronized ?? coreInfo?.syncing === false),
    connections:
      typeof coreInfo?.connections === 'number' && Number.isFinite(coreInfo.connections)
        ? Math.max(0, Math.min(100000, Math.floor(coreInfo.connections)))
        : 0,
  };

  const userStatus =
    raw.userStatus && typeof raw.userStatus === 'object' ? raw.userStatus : null;
  const session = {
    loggedIn: Boolean(userStatus && (userStatus.session || userStatus.genesis || userStatus.username)),
  };

  return {
    apiVersion: API_VERSION,
    walletVersion:
      typeof raw.walletVersion === 'string'
        ? raw.walletVersion.slice(0, 32)
        : '',
    theme,
    settings,
    core,
    session,
    moduleState:
      raw.moduleState && typeof raw.moduleState === 'object'
        ? JSON.parse(JSON.stringify(raw.moduleState))
        : null,
    storageData:
      raw.storageData && typeof raw.storageData === 'object'
        ? JSON.parse(JSON.stringify(raw.storageData))
        : {},
  };
}

module.exports = {
  API_VERSION,
  CAPABILITIES,
  CHANNELS,
  DEFAULT_CAPABILITIES,
  ERROR_CODES,
  MAX_STORAGE_JSON_BYTES,
  MAX_STATE_JSON_BYTES,
  METHOD_CAPABILITY,
  METHODS,
  normalizeManifestCapabilities,
  sanitizeWalletContext,
  validateConfirmOptions,
  validateInvokeRequest,
  validateModuleOpenUrl,
  validateNotifyOptions,
  validateSendDraft,
};
