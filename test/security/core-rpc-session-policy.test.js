'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createCoreRpcSessionPolicy: createPolicy,
} = require('../../src/main/ipc/coreRpcSessionPolicy');

function createCoreRpcSessionPolicy() {
  const policy = createPolicy();
  const infoRequest = policy.authorize({ endpoint: 'system/get/info' });
  policy.observe(infoRequest, { multiuser: true });
  return policy;
}

test('ordinary Core RPC calls remain sessionless in single-user mode', () => {
  const policy = createPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const infoRequest = policy.authorize({ endpoint: 'system/get/info' });
  policy.observe(infoRequest, { multiuser: false });

  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: undefined,
  });
});

test('Core reset ignores stale multi-user mode responses', () => {
  const policy = createPolicy();
  const staleInfoRequest = policy.authorize({ endpoint: 'system/get/info' });
  policy.reset();
  policy.observe(staleInfoRequest, { multiuser: true });
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'stale-session-01' }
  );

  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: undefined,
  });
});

test('ordinary Core RPC calls use only the main-owned active session', () => {
  const policy = createCoreRpcSessionPolicy();
  const createRequest = {
    endpoint: 'sessions/create/local',
    params: { username: 'alice', password: 'secret', pin: '1234' },
  };
  policy.observe(createRequest, { session: 'active-session-01' });

  assert.deepEqual(
    policy.authorize({
      endpoint: 'finance/get/balances',
      params: { session: 'victim-session-01', where: 'field=balance' },
    }),
    {
      endpoint: 'finance/get/balances',
      params: { session: 'active-session-01', where: 'field=balance' },
    }
  );
  assert.deepEqual(
    Object.keys(
      policy.authorize({
        endpoint: 'finance/get/balances',
        params: { where: 'field=balance' },
      }).params
    ),
    ['session', 'where']
  );
});

test('explicit sessions remain limited to session-management endpoints', () => {
  const policy = createCoreRpcSessionPolicy();
  const request = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'selected-session-01' },
  });

  assert.deepEqual(request, {
    endpoint: 'sessions/status/local',
    params: { session: 'selected-session-01' },
  });
  policy.observe(request, { username: 'alice' });
  assert.deepEqual(
    policy.authorize({ endpoint: 'profiles/status/master' }),
    {
      endpoint: 'profiles/status/master',
      params: { session: 'selected-session-01' },
    }
  );
});

test('stale session selection responses cannot replace a newer session', () => {
  const policy = createCoreRpcSessionPolicy();
  const olderRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'older-session-01' },
  });

  const newerRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'newer-session-01' },
  });

  policy.observe(newerRequest, { username: 'bob' });
  policy.observe(olderRequest, { username: 'alice' });

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'newer-session-01'
  );
});

test('ordinary Core RPC calls fail closed while session selection is pending', () => {
  const policy = createCoreRpcSessionPolicy();
  const request = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'selected-session-01' },
  });

  assert.throws(
    () => policy.authorize({ endpoint: 'finance/get/balances' }),
    /session selection is pending/
  );
  policy.observe(request, { username: 'alice' });
  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'selected-session-01'
  );
});

test('concurrent terminations independently clear the active session', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const activeTermination = policy.authorize({
    endpoint: 'sessions/terminate/local',
    params: { session: 'active-session-01' },
  });
  const otherTermination = policy.authorize({
    endpoint: 'sessions/terminate/local',
    params: { session: 'other-session-01' },
  });

  policy.observe(activeTermination, {});
  policy.observe(otherTermination, {});

  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: undefined,
  });
});

test('termination prevents in-flight selection responses from restoring a session', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const statusRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'active-session-01' },
  });
  const terminationRequest = policy.authorize({
    endpoint: 'sessions/terminate/local',
    params: { session: 'active-session-01' },
  });

  policy.observe(terminationRequest, {});
  policy.observe(statusRequest, { username: 'alice' });

  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: undefined,
  });
});

test('termination preserves session selections authorized after logout', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const terminationRequest = policy.authorize({
    endpoint: 'sessions/terminate/local',
    params: { session: 'active-session-01' },
  });
  const newerRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'newer-session-01' },
  });

  policy.observe(terminationRequest, {});
  policy.observe(newerRequest, { username: 'bob' });

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'newer-session-01'
  );
});

test('termination preserves logins authorized after logout', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const terminationRequest = policy.authorize({
    endpoint: 'sessions/terminate/local',
    params: { session: 'active-session-01' },
  });
  const createRequest = policy.authorize({
    endpoint: 'sessions/create/local',
    params: { username: 'bob', password: 'secret', pin: '5678' },
  });

  policy.observe(terminationRequest, {});
  policy.observe(createRequest, { session: 'new-session-01' });

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'new-session-01'
  );
});

test('sessionless termination does not clear a newer completed login', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const terminationRequest = policy.authorize({
    endpoint: 'sessions/terminate/local',
  });
  const createRequest = policy.authorize({
    endpoint: 'sessions/create/local',
    params: { username: 'bob', password: 'secret', pin: '5678' },
  });

  policy.observe(createRequest, { session: 'new-session-01' });
  policy.observe(terminationRequest, {});

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'new-session-01'
  );
});

test('untracked sessionless termination does not clear the active session', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );

  policy.observe({ endpoint: 'sessions/terminate/local' }, {});

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'active-session-01'
  );
});

test('termination invalidates newer selections of the terminated session', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const terminationRequest = policy.authorize({
    endpoint: 'sessions/terminate/local',
    params: { session: 'active-session-01' },
  });
  const statusRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'active-session-01' },
  });

  policy.observe(terminationRequest, {});
  policy.observe(statusRequest, { username: 'alice' });

  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: undefined,
  });
});

test('terminating another session invalidates only selections of that session', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'bob', password: 'secret', pin: '1234' },
    },
    { session: 'active-session-01' }
  );
  const terminationRequest = policy.authorize({
    endpoint: 'sessions/terminate/local',
    params: { session: 'other-session-01' },
  });
  const statusRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'other-session-01' },
  });

  policy.observe(terminationRequest, {});
  policy.observe(statusRequest, { username: 'alice' });

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'active-session-01'
  );
});

test('a stale status response cannot replace a newly created session', () => {
  const policy = createCoreRpcSessionPolicy();
  const statusRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'older-session-01' },
  });
  const createRequest = policy.authorize({
    endpoint: 'sessions/create/local',
    params: { username: 'bob', password: 'secret', pin: '1234' },
  });

  policy.observe(createRequest, { session: 'created-session-01' });
  policy.observe(statusRequest, { username: 'alice' });

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'created-session-01'
  );
});

test('sessionless status polling cannot supersede an explicit selection', () => {
  const policy = createCoreRpcSessionPolicy();
  const unlockRequest = policy.authorize({
    endpoint: 'sessions/unlock/local',
    params: { session: 'selected-session-01', pin: '1234' },
  });
  const statusRequest = policy.authorize({
    endpoint: 'sessions/status/local',
  });

  policy.observe(statusRequest, { username: 'alice' });
  policy.observe(unlockRequest, { username: 'alice' });

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'selected-session-01'
  );
});

test('session polling cannot replace an in-flight newly created session', () => {
  const policy = createCoreRpcSessionPolicy();
  const createRequest = policy.authorize({
    endpoint: 'sessions/create/local',
    params: { username: 'bob', password: 'secret', pin: '1234' },
  });
  const listRequest = policy.authorize({
    endpoint: 'sessions/list/local',
  });

  policy.observe(listRequest, []);
  assert.throws(
    () => policy.authorize({ endpoint: 'finance/get/balances' }),
    /session selection is pending/
  );

  policy.observe(createRequest, { session: 'created-session-01' });
  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'created-session-01'
  );
});

test('session polling resumes after an explicit selection fails', () => {
  const policy = createCoreRpcSessionPolicy();
  const createRequest = policy.authorize({
    endpoint: 'sessions/create/local',
    params: { username: 'bob', password: 'secret', pin: '1234' },
  });
  policy.cancel(createRequest);
  const listRequest = policy.authorize({
    endpoint: 'sessions/list/local',
  });

  policy.observe(listRequest, [
    { session: 'listed-session-01', accessed: 10 },
  ]);

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'listed-session-01'
  );
});

test('stale session list responses cannot replace a newer session', () => {
  const policy = createCoreRpcSessionPolicy();
  const olderRequest = policy.authorize({
    endpoint: 'sessions/list/local',
  });
  const newerRequest = policy.authorize({
    endpoint: 'sessions/list/local',
  });

  policy.observe(newerRequest, [
    { session: 'newer-session-01', accessed: 20 },
  ]);
  policy.observe(olderRequest, [
    { session: 'older-session-01', accessed: 10 },
  ]);

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'newer-session-01'
  );
});

test('superseded selections do not block polling after the latest one fails', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'older-session-01' },
  });
  const latestRequest = policy.authorize({
    endpoint: 'sessions/status/local',
    params: { session: 'latest-session-01' },
  });
  policy.cancel(latestRequest);
  const listRequest = policy.authorize({
    endpoint: 'sessions/list/local',
  });

  policy.observe(listRequest, [
    { session: 'listed-session-01', accessed: 10 },
  ]);

  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'listed-session-01'
  );
});

test('session lists initialize the main-owned session deterministically', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    { endpoint: 'sessions/list/local' },
    [
      { session: 'older-session-01', accessed: 10 },
      { session: 'latest-session-01', accessed: 20 },
    ]
  );

  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: { session: 'latest-session-01' },
  });
});

test('session lists reconcile stale main-owned sessions', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'stale-session-01' }
  );

  policy.observe(
    { endpoint: 'sessions/list/local' },
    [
      { session: 'older-session-01', accessed: 10 },
      { session: 'latest-session-01', accessed: 20 },
    ]
  );
  assert.equal(
    policy.authorize({ endpoint: 'finance/get/balances' }).params.session,
    'latest-session-01'
  );

  policy.observe({ endpoint: 'sessions/list/local' }, []);
  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: undefined,
  });
});

test('reset clears the main-owned session when the Core instance changes', () => {
  const policy = createCoreRpcSessionPolicy();
  policy.observe(
    {
      endpoint: 'sessions/create/local',
      params: { username: 'alice', password: 'secret', pin: '1234' },
    },
    { session: 'stale-session-01' }
  );

  policy.reset();
  assert.deepEqual(policy.authorize({ endpoint: 'finance/get/balances' }), {
    endpoint: 'finance/get/balances',
    params: undefined,
  });
});
