'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  REGISTERED_CORE_RPC_ENDPOINTS,
  redactSensitiveObject,
  redactSensitiveText,
  validateCoreRpcParamsForEndpoint,
  validatePin,
  validateRecipients,
  validateSession,
} = require('../../src/main/ipc/coreRpcRegistry');

const {
  validateCoreConsoleRpcUrl,
  validateCoreRpcRequest,
  validateCoreRpcUrl,
  redactSensitiveText: contractsRedact,
} = require('../../src/main/ipc/contracts');

test('registry includes the concrete wallet endpoints used by callAPI/listAll', () => {
  for (const endpoint of [
    'system/get/info',
    'sessions/create/local',
    'sessions/validate/pin',
    'finance/debit/any',
    'names/list/names',
    'assets/create/asset',
    'tokens/create/account',
  ]) {
    assert.ok(
      REGISTERED_CORE_RPC_ENDPOINTS.includes(endpoint),
      `${endpoint} should be registered`
    );
  }
});

test('unregistered endpoints are rejected even under allowed namespaces', () => {
  for (const request of [
    { endpoint: 'system/stop' },
    { endpoint: 'system/eval/code' },
    { endpoint: 'finance/raw/execute' },
    { endpoint: 'sessions/impersonate/local' },
    { endpoint: 'users/get/admin' },
    { endpoint: 'evil/get/info' },
  ]) {
    assert.throws(() => validateCoreRpcRequest(request), (error) => {
      assert.equal(error instanceof TypeError, true);
      assert.match(String(error.message), /not registered|invalid|not allowed/i);
      return true;
    });
  }
});

test('unknown parameters are rejected for registered endpoints', () => {
  assert.throws(
    () =>
      validateCoreRpcRequest({
        endpoint: 'system/get/info',
        params: { unexpected: true },
      }),
    /Unknown Core RPC parameter/
  );
  assert.throws(
    () =>
      validateCoreRpcRequest({
        endpoint: 'finance/get/balances',
        params: { debug: 1 },
      }),
    /Unknown Core RPC parameter/
  );
  assert.throws(
    () =>
      validateCoreRpcParamsForEndpoint('sessions/validate/pin', {
        pin: '1234',
        extra: 'nope',
      }),
    /Unknown Core RPC parameter/
  );
});

test('malformed PIN, session, recipient, and query fields are rejected', () => {
  assert.throws(() => validatePin(''), TypeError);
  assert.throws(() => validatePin(1234), TypeError);
  assert.throws(() => validatePin({ value: '1234' }), TypeError);
  assert.equal(validatePin('1234'), '1234');
  assert.equal(validatePin('x'.repeat(1024)), 'x'.repeat(1024));
  assert.throws(() => validatePin('x'.repeat(1025)), TypeError);
  assert.deepEqual(
    validateCoreRpcParamsForEndpoint('sessions/create/local', {
      username: 'alice',
      password: 'x'.repeat(1024),
      pin: 'x'.repeat(1024),
    }),
    {
      username: 'alice',
      password: 'x'.repeat(1024),
      pin: 'x'.repeat(1024),
    }
  );
  assert.throws(
    () =>
      validateCoreRpcParamsForEndpoint('sessions/create/local', {
        username: 'alice',
        password: 'x'.repeat(1025),
        pin: '1234',
      }),
    TypeError
  );

  assert.throws(() => validateSession(''), TypeError);
  assert.throws(() => validateSession('short'), TypeError);
  assert.throws(() => validateSession(['session-abcdef01']), TypeError);
  assert.throws(() => validateSession({ id: 'session-abcdef01' }), TypeError);
  assert.throws(() => validateSession('sess ion!!'), TypeError);
  assert.equal(validateSession('session-abcdef01'), 'session-abcdef01');

  assert.throws(() => validateRecipients([]), TypeError);
  assert.throws(
    () => validateRecipients([{ amount: 1 }]),
    /address_to is required/
  );
  assert.throws(
    () =>
      validateRecipients([
        { address_to: 'a'.repeat(8), amount: 1, injected: true },
      ]),
    /Unknown recipient field/
  );
  assert.throws(
    () => validateRecipients([{ address_to: '../x', amount: 1 }]),
    TypeError
  );
  assert.deepEqual(
    validateRecipients([
      { address_to: 'address01', amount: 1.5, reference: '42' },
    ]),
    [{ address_to: 'address01', amount: 1.5, reference: '42' }]
  );
  for (const reference of ['abc', '-1', '1.5', '18446744073709551616']) {
    assert.throws(
      () =>
        validateRecipients([
          { address_to: 'address01', amount: 1, reference },
        ]),
      /unsigned 64-bit integer/
    );
  }
  assert.equal(
    validateRecipients([
      {
        address_to: 'address01',
        amount: 1,
        reference: '18446744073709551615',
      },
    ])[0].reference,
    '18446744073709551615'
  );
  assert.throws(
    () =>
      validateRecipients(
        Array.from({ length: 100 }, () => ({
          address_to: 'address01',
          amount: 1,
        }))
      ),
    /between 1 and 99/
  );
  for (const endpoint of ['finance/debit/any', 'finance/debit/token']) {
    const params = {
      pin: '1234',
      from: 'address01',
      recipients: [{ address_to: 'address02', amount: 1 }],
      reference: '18446744073709551615',
    };
    assert.equal(
      validateCoreRpcRequest({ endpoint, params }).params.reference,
      params.reference
    );
    assert.throws(
      () =>
        validateCoreRpcRequest({
          endpoint,
          params: { ...params, reference: '18446744073709551616' },
        }),
      /unsigned 64-bit integer/
    );
  }

  assert.throws(
    () =>
      validateCoreRpcRequest({
        endpoint: 'profiles/transactions/master',
        params: { limit: 0 },
      }),
    /out of range|invalid/i
  );
  assert.throws(
    () =>
      validateCoreRpcRequest({
        endpoint: 'profiles/transactions/master',
        params: { page: -1 },
      }),
    /out of range|invalid/i
  );
  assert.throws(
    () =>
      validateCoreRpcRequest({
        endpoint: 'profiles/transactions/master',
        params: { order: 'sideways' },
      }),
    TypeError
  );
  assert.throws(
    () =>
      validateCoreRpcRequest({
        endpoint: 'profiles/transactions/master',
        params: { where: { $ne: null } },
      }),
    TypeError
  );
});

test('multi-user session injection shapes are rejected', () => {
  const endpoint = 'finance/get/balances';

  for (const session of [
    ['victim-session-01'],
    { session: 'victim-session-01' },
    { toString: () => 'victim-session-01' },
    'bad session',
    '',
    1234567890,
    null,
  ]) {
    assert.throws(
      () => validateCoreRpcRequest({ endpoint, params: { session } }),
      TypeError
    );
  }

  const polluted = { session: 'ok-session' };
  Object.defineProperty(polluted, '__proto__', {
    value: { admin: true },
    enumerable: true,
    configurable: true,
    writable: true,
  });
  assert.throws(
    () => validateCoreRpcRequest({ endpoint, params: polluted }),
    /not allowed|Unknown/
  );

  // A well-formed session is accepted and returned.
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint,
      params: { session: 'active-session-01' },
    }),
    { endpoint, params: { session: 'active-session-01' } }
  );

  // Valid debit request still works with session attached.
  assert.equal(
    validateCoreRpcRequest({
      endpoint: 'finance/debit/any',
      params: {
        pin: '9999',
        from: 'fromaddress01',
        recipients: [{ address_to: 'toaddress01', amount: 1 }],
        session: 'active-session-01',
      },
    }).params.session,
    'active-session-01'
  );
});

test('credential and session material is not leaked by redaction helpers', () => {
  const dirtyObject = {
    pin: 'super-secret-pin',
    password: 'hunter2',
    session: 'session-should-hide',
    nested: { new_password: 'new-secret', amount: 5 },
    safe: 'visible',
  };
  const redacted = redactSensitiveObject(dirtyObject);
  assert.equal(redacted.pin, '***');
  assert.equal(redacted.password, '***');
  assert.equal(redacted.session, '***');
  assert.equal(redacted.nested.new_password, '***');
  assert.equal(redacted.nested.amount, 5);
  assert.equal(redacted.safe, 'visible');
  assert.equal(JSON.stringify(redacted).includes('super-secret-pin'), false);
  assert.equal(JSON.stringify(redacted).includes('hunter2'), false);
  assert.equal(JSON.stringify(redacted).includes('session-should-hide'), false);

  const dirtyText =
    'IPC failed pin=super-secret-pin ****** session=session-should-hide {"new_pin":"4321"}';
  const cleaned = redactSensitiveText(dirtyText);
  assert.equal(cleaned.includes('super-secret-pin'), false);
  assert.equal(cleaned.includes('hunter2'), false);
  assert.equal(cleaned.includes('session-should-hide'), false);
  assert.equal(cleaned.includes('4321'), false);
  assert.match(cleaned, /pin=\*\*\*/i);
  assert.equal(contractsRedact(dirtyText).includes('super-secret-pin'), false);
  for (const prefixed of [
    'pin=at-start',
    `-${'password'}=single-dash`,
    '--session=double-dash',
  ]) {
    assert.equal(redactSensitiveText(prefixed).includes(prefixed.split('=')[1]), false);
  }
  for (const [quoted, secret] of [
    [`--${'password'}="quoted double"`, 'quoted double'],
    [`--pin='quoted single'`, 'quoted single'],
    [`password: 'hunter2'`, 'hunter2'],
    [`{ pin: "1234" }`, '1234'],
    [`{'session': 'session-secret'}`, 'session-secret'],
  ]) {
    assert.equal(redactSensitiveText(quoted).includes(secret), false);
  }

  // Validator errors must not echo the provided secret.
  try {
    validateCoreRpcRequest({
      endpoint: 'sessions/validate/pin',
      params: { pin: { nested: 'super-secret-pin' } },
    });
    assert.fail('expected validation failure');
  } catch (error) {
    assert.equal(String(error.message).includes('super-secret-pin'), false);
  }
});

test('Terminal callByUrl remains a namespace-constrained console exception', () => {
  assert.equal(
    validateCoreConsoleRpcUrl('finance/get/any?name=default'),
    'finance/get/any?name=default'
  );
  assert.equal(
    validateCoreRpcUrl('system/get/info'),
    'system/get/info'
  );
  // Console may use paths that are not in the structured registry.
  assert.equal(
    validateCoreConsoleRpcUrl('market/list/orders'),
    'market/list/orders'
  );
  assert.throws(() => validateCoreConsoleRpcUrl('evil/get/info'), TypeError);
  assert.throws(
    () => validateCoreConsoleRpcUrl('https://evil.example/system/get/info'),
    TypeError
  );

  // Structured call still rejects console-only namespaces/endpoints.
  assert.throws(
    () => validateCoreRpcRequest({ endpoint: 'market/list/orders' }),
    /not registered/
  );
});

test('happy-path structured requests still validate', () => {
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'profiles/update/recovery',
      params: {
        password: 'correct-horse',
        pin: '1234',
        new_recovery: 'new phrase',
      },
    }).params,
    {
      password: 'correct-horse',
      pin: '1234',
      new_recovery: 'new phrase',
    }
  );
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'finance/create/account',
      params: { pin: '1234', name: '' },
    }).params,
    { pin: '1234' }
  );
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'names/create/name',
      params: { pin: '1234', name: 'example', register: '' },
    }).params,
    { pin: '1234', name: 'example' }
  );
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'system/validate/address',
      params: { address: 'address01' },
    }),
    {
      endpoint: 'system/validate/address',
      params: { address: 'address01' },
    }
  );
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'sessions/create/local',
      params: {
        username: 'alice',
        password: 'correct-horse',
        pin: '1234',
      },
    }).endpoint,
    'sessions/create/local'
  );
});

test('bounded numeric strings are normalized without rounding uint64 values', () => {
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'finance/create/token',
      params: {
        pin: '1234',
        supply: '1000',
        decimals: '2',
      },
    }).params,
    { pin: '1234', supply: '1000', decimals: 2 }
  );
  assert.equal(
    validateCoreRpcRequest({
      endpoint: 'finance/create/token',
      params: {
        pin: '1234',
        supply: '18446744073709551615',
        decimals: 2,
      },
    }).params.supply,
    '18446744073709551615'
  );
  assert.throws(
    () =>
      validateCoreRpcRequest({
        endpoint: 'finance/create/token',
        params: {
          pin: '1234',
          supply: '18446744073709551616',
          decimals: 2,
        },
      }),
    /unsigned 64-bit integer/
  );
  for (const supply of [0, '0', 1000.5, '1000.5']) {
    assert.throws(
      () =>
        validateCoreRpcRequest({
          endpoint: 'finance/create/token',
          params: { pin: '1234', supply, decimals: 2 },
        }),
      TypeError
    );
  }
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'assets/create/asset',
      params: {
        pin: '1234',
        json: [
          { name: 'label', type: 'string', mutable: true, value: '', maxlength: '64' },
        ],
      },
    }).params.json[0].maxlength,
    64
  );
  for (const amount of ['1e3', ' 1', 'Infinity', '0x10']) {
    assert.throws(
      () =>
        validateCoreRpcRequest({
          endpoint: 'finance/set/stake',
          params: { pin: '1234', amount },
        }),
      TypeError
    );
  }
});

test('asset updates accept bounded prototype-safe schema field names', () => {
  assert.deepEqual(
    validateCoreRpcRequest({
      endpoint: 'assets/update/asset',
      params: {
        pin: '1234',
        address: 'address01',
        'serial-number': 'A-1',
        'display name': 'Example',
        toString: 'Custom label',
      },
    }).params,
    {
      pin: '1234',
      address: 'address01',
      'serial-number': 'A-1',
      'display name': 'Example',
      toString: 'Custom label',
    }
  );

  for (const key of ['__proto__', 'constructor', 'prototype', 'x'.repeat(65)]) {
    const params = { pin: '1234', address: 'address01' };
    Object.defineProperty(params, key, {
      value: 'unsafe',
      enumerable: true,
    });
    assert.throws(
      () =>
        validateCoreRpcRequest({
          endpoint: 'assets/update/asset',
          params,
        }),
      TypeError
    );
  }
});

test('asset creation rejects mutable field names that updates cannot accept', () => {
  for (const name of [
    '__proto__',
    'constructor',
    'prototype',
    'pin',
    'address',
    'session',
  ]) {
    assert.throws(
      () =>
        validateCoreRpcRequest({
          endpoint: 'assets/create/asset',
          params: {
            pin: '1234',
            json: [{ name, type: 'string', mutable: true, value: '' }],
          },
        }),
      TypeError
    );
  }
});
