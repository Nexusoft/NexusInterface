'use strict';

/**
 * Concrete Core RPC endpoint registry.
 *
 * This is the allowlist used by structured `core-rpc:call` requests. It is
 * derived from the wallet's typed `callAPI`/`listAll` surface in
 * `src/shared/lib/api.ts` plus live call sites under `src/`.
 *
 * Terminal / Nexus API console traffic does **not** use this registry. It goes
 * through the separately constrained `core-rpc:call-by-url` console capability
 * (namespace allowlist + relative path checks). See
 * `docs/security/core-rpc-endpoint-registry.md`.
 */

const SENSITIVE_PARAM_KEYS = Object.freeze([
  'pin',
  'password',
  'recovery',
  'new_pin',
  'new_password',
  'new_recovery',
  'session',
  'apipassword',
  'api_password',
  'apikey',
  'api_key',
  'apiuser',
  'api_user',
  'authorization',
  'auth',
  'token',
]);

const SENSITIVE_PARAM_KEY_SET = new Set(SENSITIVE_PARAM_KEYS);
const MUTABLE_ASSET_RESERVED_NAMES = new Set(['pin', 'address', 'session']);
const MAX_CORE_CREDENTIAL_LENGTH = 1024;
const MAX_UINT64 = 18446744073709551615n;

// Multi-user Core installs automatically attach a session id to structured
// calls. Every registered endpoint therefore accepts an optional session.
const SESSION_FIELD = Object.freeze({
  type: 'session',
  optional: true,
});

const QUERY_FIELDS = Object.freeze({
  limit: Object.freeze({ type: 'queryLimit', optional: true }),
  page: Object.freeze({ type: 'queryPage', optional: true }),
  offset: Object.freeze({ type: 'queryOffset', optional: true }),
  sort: Object.freeze({ type: 'string', optional: true, min: 1, max: 64 }),
  order: Object.freeze({
    type: 'enum',
    optional: true,
    values: Object.freeze(['asc', 'desc']),
  }),
  where: Object.freeze({ type: 'string', optional: true, min: 0, max: 4096 }),
});

function fail(message) {
  throw new TypeError(message);
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function assertSafeKey(key, label = 'Parameter') {
  if (typeof key !== 'string' || !key) {
    fail(`${label} name is invalid`);
  }
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    fail(`${label} name is not allowed`);
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    fail(`${label} name contains unsupported characters`);
  }
  return key;
}

function assertSafeAdditionalKey(key, label = 'Parameter') {
  assertString(key, `${label} name`, { min: 1, max: 64 });
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    fail(`${label} name is not allowed`);
  }
  return key;
}

function assertString(value, name, { min = 0, max = 4096, pattern } = {}) {
  if (typeof value !== 'string' || value.length < min || value.length > max) {
    fail(`${name} must be a string between ${min} and ${max} characters`);
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    fail(`${name} contains invalid control characters`);
  }
  if (pattern && !pattern.test(value)) {
    fail(`${name} is invalid`);
  }
  return value;
}

function assertBoolean(value, name) {
  if (typeof value !== 'boolean') fail(`${name} must be a boolean`);
  return value;
}

function assertFiniteNumber(value, name, { min, max, integer = false } = {}) {
  const normalizedValue =
    typeof value === 'string' &&
    /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value)
      ? Number(value)
      : value;
  if (typeof normalizedValue !== 'number' || !Number.isFinite(normalizedValue)) {
    fail(`${name} must be a finite number`);
  }
  if (integer && !Number.isInteger(normalizedValue)) {
    fail(`${name} must be an integer`);
  }
  if (min !== undefined && normalizedValue < min) {
    fail(`${name} is out of range`);
  }
  if (max !== undefined && normalizedValue > max) {
    fail(`${name} is out of range`);
  }
  return normalizedValue;
}

function validateUint64(value, name, { min = 0 } = {}) {
  if (
    typeof value !== 'string' &&
    (typeof value !== 'number' || !Number.isSafeInteger(value))
  ) {
    fail(`${name} must be an unsigned 64-bit integer`);
  }
  const decimal = String(value);
  if (
    !/^\d+$/.test(decimal) ||
    BigInt(decimal) < BigInt(min) ||
    BigInt(decimal) > MAX_UINT64
  ) {
    fail(`${name} must be an unsigned 64-bit integer`);
  }
  return value;
}

function validatePin(value, name = 'pin') {
  // Core PINs are secrets. Accept numeric or general strings within bounds
  // without echoing the value back in errors.
  return assertString(value, name, {
    min: 1,
    max: MAX_CORE_CREDENTIAL_LENGTH,
  });
}

function validatePassword(value, name = 'password') {
  return assertString(value, name, {
    min: 1,
    max: MAX_CORE_CREDENTIAL_LENGTH,
  });
}

function validateSession(value, name = 'session') {
  // Session identifiers are opaque Core tokens. Reject arrays/objects and
  // anything that does not look like a single session id string.
  return assertString(value, name, {
    min: 8,
    max: 128,
    pattern: /^[A-Za-z0-9_-]+$/,
  });
}

function validateUsername(value, name = 'username') {
  return assertString(value, name, { min: 1, max: 100 });
}

function validateAddress(value, name = 'address') {
  return assertString(value, name, {
    min: 1,
    max: 128,
    pattern: /^[A-Za-z0-9:._-]+$/,
  });
}

function validateName(value, name = 'name') {
  return assertString(value, name, { min: 1, max: 100 });
}

function validateRecipient(value, index) {
  if (!isPlainObject(value)) {
    fail(`recipients[${index}] must be an object`);
  }
  const allowed = new Set(['address_to', 'amount', 'reference']);
  for (const key of Object.keys(value)) {
    assertSafeKey(key, 'Recipient field');
    if (!allowed.has(key)) {
      fail(`Unknown recipient field: ${key}`);
    }
  }
  if (value.address_to === undefined) {
    fail(`recipients[${index}].address_to is required`);
  }
  if (value.amount === undefined) {
    fail(`recipients[${index}].amount is required`);
  }
  const recipient = {
    address_to: validateAddress(value.address_to, `recipients[${index}].address_to`),
    amount: assertFiniteNumber(value.amount, `recipients[${index}].amount`, {
      min: 0,
    }),
  };
  if (value.reference !== undefined) {
    recipient.reference = validateUint64(
      value.reference,
      `recipients[${index}].reference`
    );
  }
  return recipient;
}

function validateRecipients(value, name = 'recipients') {
  // Wallet send UI uses an array; older docs/types sometimes show a single
  // object. Accept either and normalize to an array.
  const list = Array.isArray(value) ? value : [value];
  if (!list.length || list.length > 99) {
    fail(`${name} must contain between 1 and 99 recipients`);
  }
  return list.map((entry, index) => validateRecipient(entry, index));
}

function validateAssetJsonField(value, index) {
  if (!isPlainObject(value)) {
    fail(`json[${index}] must be an object`);
  }
  const allowed = new Set(['name', 'value', 'mutable', 'type', 'maxlength']);
  for (const key of Object.keys(value)) {
    assertSafeKey(key, 'Asset field');
    if (!allowed.has(key)) {
      fail(`Unknown asset field property: ${key}`);
    }
  }
  const field = {
    name: assertSafeAdditionalKey(value.name, `json[${index}]`),
    type: assertString(value.type, `json[${index}].type`, { min: 1, max: 32 }),
    mutable: assertBoolean(value.mutable, `json[${index}].mutable`),
  };
  if (field.mutable && MUTABLE_ASSET_RESERVED_NAMES.has(field.name)) {
    fail(`json[${index}].name is reserved for asset updates`);
  }
  if (value.value === undefined || value.value === null) {
    fail(`json[${index}].value is required`);
  }
  if (
    !['string', 'number', 'boolean'].includes(typeof value.value) &&
    !Array.isArray(value.value)
  ) {
    fail(`json[${index}].value is invalid`);
  }
  if (typeof value.value === 'string' && value.value.length > 8192) {
    fail(`json[${index}].value is too long`);
  }
  field.value = value.value;
  if (value.maxlength !== undefined) {
    field.maxlength = assertFiniteNumber(
      value.maxlength,
      `json[${index}].maxlength`,
      { integer: true, min: 1, max: 8192 }
    );
  }
  return field;
}

function validateField(value, name, schema) {
  if (value === '' && schema.emptyAsUndefined) {
    return undefined;
  }
  if (value === undefined) {
    if (schema.optional) return undefined;
    fail(`${name} is required`);
  }
  if (value === null) {
    fail(`${name} must not be null`);
  }

  switch (schema.type) {
    case 'pin':
      return validatePin(value, name);
    case 'password':
      return validatePassword(value, name);
    case 'session':
      return validateSession(value, name);
    case 'username':
      return validateUsername(value, name);
    case 'address':
      return validateAddress(value, name);
    case 'name':
      return validateName(value, name);
    case 'string':
      return assertString(value, name, schema);
    case 'boolean':
      return assertBoolean(value, name);
    case 'number':
      return assertFiniteNumber(value, name, schema);
    case 'integer':
      return assertFiniteNumber(value, name, { ...schema, integer: true });
    case 'uint64':
      return validateUint64(value, name, schema);
    case 'queryLimit':
      return assertFiniteNumber(value, name, {
        integer: true,
        min: 1,
        max: 1000,
      });
    case 'queryPage':
      return assertFiniteNumber(value, name, {
        integer: true,
        min: 0,
        max: 1000000,
      });
    case 'queryOffset':
      return assertFiniteNumber(value, name, {
        integer: true,
        min: 0,
        max: 100000000,
      });
    case 'enum':
      if (!schema.values.includes(value)) {
        fail(`${name} is invalid`);
      }
      return value;
    case 'recipients':
      return validateRecipients(value, name);
    case 'assetJson': {
      if (!Array.isArray(value) || !value.length || value.length > 256) {
        fail(`${name} must be a non-empty array of at most 256 fields`);
      }
      return value.map((entry, index) => validateAssetJsonField(entry, index));
    }
    case 'primitive': {
      if (!['string', 'number', 'boolean'].includes(typeof value)) {
        fail(`${name} must be a string, number, or boolean`);
      }
      if (typeof value === 'string') {
        return assertString(value, name, { min: 0, max: schema.max || 4096 });
      }
      if (typeof value === 'number') {
        return assertFiniteNumber(value, name);
      }
      return value;
    }
    default:
      fail(`Unsupported schema type for ${name}`);
  }
}

function defineEndpoint(fields = {}, options = {}) {
  return Object.freeze({
    fields: Object.freeze({ ...fields, session: SESSION_FIELD }),
    allowAdditionalPrimitives: options.allowAdditionalPrimitives === true,
  });
}

function withQuery(fields = {}, options = {}) {
  return defineEndpoint({ ...QUERY_FIELDS, ...fields }, options);
}

/**
 * Registry of structured Core RPC endpoints the renderer may invoke.
 * Unknown endpoints are rejected even if the namespace would previously have
 * been allowed.
 */
const CORE_RPC_ENDPOINT_REGISTRY = Object.freeze({
  // system
  'system/get/info': defineEndpoint(),
  'system/list/peers': defineEndpoint(),
  'system/validate/address': defineEndpoint({
    address: { type: 'address' },
  }),

  // ledger
  'ledger/get/info': defineEndpoint(),
  'ledger/get/transaction': defineEndpoint({
    txid: { type: 'string', min: 1, max: 128 },
    verbose: { type: 'string', optional: true, min: 1, max: 32 },
  }),

  // sessions
  'sessions/status/local': defineEndpoint(),
  'sessions/create/local': defineEndpoint({
    username: { type: 'username' },
    password: { type: 'password' },
    pin: { type: 'pin' },
  }),
  'sessions/terminate/local': defineEndpoint(),
  'sessions/list/local': defineEndpoint(),
  'sessions/unlock/local': defineEndpoint({
    pin: { type: 'pin' },
    notifications: { type: 'boolean', optional: true },
    staking: { type: 'boolean', optional: true },
    mining: { type: 'boolean', optional: true },
  }),
  'sessions/validate/pin': defineEndpoint({
    pin: { type: 'pin' },
  }),

  // profiles
  'profiles/status/master': defineEndpoint({
    username: { type: 'username', optional: true },
    genesis: { type: 'string', optional: true, min: 1, max: 128 },
  }),
  'profiles/transactions/master': withQuery({
    verbose: { type: 'string', optional: true, min: 1, max: 32 },
  }),
  'profiles/update/credentials': defineEndpoint({
    password: { type: 'password' },
    pin: { type: 'pin' },
    new_password: { type: 'password' },
    new_pin: { type: 'pin' },
  }),
  'profiles/create/auth': defineEndpoint({
    username: { type: 'username' },
    password: { type: 'password' },
    pin: { type: 'pin' },
  }),
  'profiles/create/master': defineEndpoint({
    username: { type: 'username' },
    password: { type: 'password' },
    pin: { type: 'pin' },
  }),
  'profiles/recover/master': defineEndpoint({
    username: { type: 'username' },
    password: { type: 'password' },
    pin: { type: 'pin' },
    recovery: { type: 'password' },
  }),
  'profiles/update/recovery': defineEndpoint({
    password: { type: 'password' },
    pin: { type: 'pin' },
    recovery: { type: 'password', optional: true },
    new_recovery: { type: 'password' },
  }),

  // finance
  'finance/debit/any': defineEndpoint({
    pin: { type: 'pin' },
    from: { type: 'address' },
    recipients: { type: 'recipients' },
    reference: { type: 'uint64', optional: true },
    expires: { type: 'integer', optional: true, min: 0 },
  }),
  'finance/debit/token': defineEndpoint({
    pin: { type: 'pin' },
    from: { type: 'address' },
    recipients: { type: 'recipients' },
    reference: { type: 'uint64', optional: true },
    expires: { type: 'integer', optional: true, min: 0 },
  }),
  'finance/get/any': defineEndpoint({
    name: { type: 'name', optional: true },
    address: { type: 'address', optional: true },
  }),
  'finance/get/token': defineEndpoint({
    name: { type: 'name', optional: true },
    address: { type: 'address', optional: true },
  }),
  'finance/transactions/any': withQuery({
    verbose: { type: 'string', optional: true, min: 1, max: 32 },
    name: { type: 'name', optional: true },
    address: { type: 'address', optional: true },
  }),
  'finance/set/stake': defineEndpoint({
    pin: { type: 'pin' },
    amount: { type: 'number', min: 0 },
  }),
  'finance/create/account': defineEndpoint({
    pin: { type: 'pin' },
    name: { type: 'name', optional: true, emptyAsUndefined: true },
  }),
  'finance/create/token': defineEndpoint({
    pin: { type: 'pin' },
    name: { type: 'name', optional: true },
    data: { type: 'primitive', optional: true, max: 4096 },
    supply: { type: 'uint64', min: 1 },
    decimals: { type: 'integer', min: 0, max: 8 },
  }),
  'finance/get/stakeinfo': defineEndpoint(),
  'finance/get/balances': defineEndpoint(),
  'finance/list/tokens': withQuery(),
  'finance/list/any': withQuery(),

  // names
  'names/get/name': defineEndpoint({
    name: { type: 'name', optional: true },
    address: { type: 'address', optional: true },
  }),
  'names/get/inactive': defineEndpoint({
    name: { type: 'name', optional: true },
    address: { type: 'address', optional: true },
  }),
  'names/reverse/lookup': defineEndpoint({
    address: { type: 'address' },
  }),
  'names/history/name': defineEndpoint({
    address: { type: 'address' },
  }),
  'names/history/namespace': defineEndpoint({
    address: { type: 'address' },
  }),
  'names/transfer/name': defineEndpoint({
    pin: { type: 'pin' },
    address: { type: 'address', optional: true },
    name: { type: 'name', optional: true },
    username: { type: 'username', optional: true },
    destination: { type: 'address', optional: true },
  }),
  'names/transfer/namespace': defineEndpoint({
    pin: { type: 'pin' },
    address: { type: 'address', optional: true },
    namespace: { type: 'name', optional: true },
    username: { type: 'username', optional: true },
    destination: { type: 'address', optional: true },
  }),
  'names/create/name': defineEndpoint({
    pin: { type: 'pin' },
    name: { type: 'name' },
    global: { type: 'boolean', optional: true },
    namespace: { type: 'name', optional: true },
    register: { type: 'address', optional: true, emptyAsUndefined: true },
  }),
  'names/create/namespace': defineEndpoint({
    pin: { type: 'pin' },
    namespace: { type: 'name' },
  }),
  'names/update/name': defineEndpoint({
    pin: { type: 'pin' },
    address: { type: 'address' },
    register: { type: 'address' },
  }),
  'names/rename/name': defineEndpoint({
    pin: { type: 'pin' },
    name: { type: 'name' },
    new: { type: 'name' },
  }),
  'names/list/names': withQuery(),
  'names/list/inactive': withQuery(),
  'names/list/namespaces': withQuery(),

  // assets
  'assets/get/schema': defineEndpoint({
    address: { type: 'address' },
  }),
  'assets/history/asset': defineEndpoint({
    address: { type: 'address' },
  }),
  'assets/create/asset': defineEndpoint({
    pin: { type: 'pin' },
    name: { type: 'name', optional: true },
    format: { type: 'string', optional: true, min: 1, max: 32 },
    json: { type: 'assetJson', optional: true },
  }),
  'assets/update/asset': defineEndpoint(
    {
      pin: { type: 'pin' },
      address: { type: 'address' },
    },
    // Mutable asset schema fields are forwarded as top-level primitives.
    { allowAdditionalPrimitives: true }
  ),
  'assets/transfer/asset': defineEndpoint({
    pin: { type: 'pin' },
    address: { type: 'address' },
    destination: { type: 'address', optional: true },
    username: { type: 'username', optional: true },
  }),
  'assets/tokenize/asset': defineEndpoint({
    pin: { type: 'pin' },
    address: { type: 'address' },
    token: { type: 'string', min: 1, max: 128 },
  }),
  'assets/list/assets': withQuery(),
  'assets/list/partial': withQuery(),

  // tokens
  'tokens/create/account': defineEndpoint({
    pin: { type: 'pin' },
    token: { type: 'string', min: 1, max: 128 },
  }),
});

const REGISTERED_CORE_RPC_ENDPOINTS = Object.freeze(
  Object.keys(CORE_RPC_ENDPOINT_REGISTRY)
);

function getCoreRpcEndpointSchema(endpoint) {
  return CORE_RPC_ENDPOINT_REGISTRY[endpoint];
}

function assertRegisteredCoreRpcEndpoint(
  endpoint,
  name = 'Core RPC endpoint'
) {
  const value = assertString(endpoint, name, { min: 3, max: 96 });
  if (!/^[a-z]+(?:\/[a-z0-9_-]+){1,4}$/.test(value)) {
    fail(`${name} is invalid`);
  }
  if (!Object.prototype.hasOwnProperty.call(CORE_RPC_ENDPOINT_REGISTRY, value)) {
    fail(`${name} is not registered`);
  }
  return value;
}

function validateCoreRpcParamsForEndpoint(endpoint, params) {
  const schema = getCoreRpcEndpointSchema(endpoint);
  if (!schema) {
    fail('Core RPC endpoint is not registered');
  }

  if (params === undefined || params === null) {
    // Ensure required fields are still enforced when params are omitted.
    for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
      if (!fieldSchema.optional) {
        fail(`${fieldName} is required`);
      }
    }
    return undefined;
  }

  if (!isPlainObject(params)) {
    fail('Core RPC params must be an object');
  }

  const validated = {};
  const knownFields = schema.fields;

  for (const key of Object.keys(params)) {
    const fieldSchema = Object.prototype.hasOwnProperty.call(knownFields, key)
      ? knownFields[key]
      : undefined;
    if (!fieldSchema) {
      if (!schema.allowAdditionalPrimitives) {
        assertSafeKey(key, 'Core RPC parameter');
        fail(`Unknown Core RPC parameter: ${key}`);
      }
      assertSafeAdditionalKey(key, 'Core RPC parameter');
      validated[key] = validateField(params[key], key, {
        type: 'primitive',
        max: 4096,
      });
      continue;
    }
    assertSafeKey(key, 'Core RPC parameter');
    const nextValue = validateField(params[key], key, fieldSchema);
    if (nextValue !== undefined) {
      validated[key] = nextValue;
    }
  }

  for (const [fieldName, fieldSchema] of Object.entries(knownFields)) {
    if (!fieldSchema.optional && validated[fieldName] === undefined) {
      // Optional presence: allow required fields only when provided. For
      // omitted required fields, fail without echoing values.
      if (!Object.prototype.hasOwnProperty.call(params, fieldName)) {
        fail(`${fieldName} is required`);
      }
    }
  }

  // Preserve Core quirk: `where` must remain the last serialized field.
  if (Object.prototype.hasOwnProperty.call(validated, 'where')) {
    const whereValue = validated.where;
    delete validated.where;
    validated.where = whereValue;
  }

  return validated;
}

function redactSensitiveValue(_value) {
  return '***';
}

function redactSensitiveObject(value, depth = 0) {
  if (depth > 6) return '[Redacted]';
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitiveObject(entry, depth + 1));
  }
  if (!isPlainObject(value)) {
    return value;
  }
  const redacted = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_PARAM_KEY_SET.has(String(key).toLowerCase())) {
      redacted[key] = redactSensitiveValue(entry);
    } else {
      redacted[key] = redactSensitiveObject(entry, depth + 1);
    }
  }
  return redacted;
}

function redactSensitiveText(text) {
  if (typeof text !== 'string' || !text) return text;
  let redacted = text;
  for (const key of SENSITIVE_PARAM_KEYS) {
    const patterns = [
      // JSON-ish: "pin":"secret"
      new RegExp(
        `((?:^|[,{\\s])(?:"${key}"|'${key}'|${key})\\s*:\\s*)("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|[A-Za-z0-9+/=_-]+)`,
        'gi'
      ),
      // query/cli: pin=secret
      new RegExp(
        `((?:^|[?&\\s])(?:--?)?${key}=)("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|[^&\\s"']+)`,
        'gi'
      ),
    ];
    for (const pattern of patterns) {
      redacted = redacted.replace(pattern, (_, prefix) => `${prefix}***`);
    }
  }
  return redacted;
}

module.exports = {
  CORE_RPC_ENDPOINT_REGISTRY,
  REGISTERED_CORE_RPC_ENDPOINTS,
  SENSITIVE_PARAM_KEYS,
  assertRegisteredCoreRpcEndpoint,
  getCoreRpcEndpointSchema,
  redactSensitiveObject,
  redactSensitiveText,
  validateCoreRpcParamsForEndpoint,
  validatePin,
  validateRecipients,
  validateSession,
};
