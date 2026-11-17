'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const loadModule = require('../helpers/load-module');

const styled = new Proxy(() => () => 'styled', {
  get: () => () => 'styled',
});

function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (predicate(tree)) return tree;
  return [tree.props?.children].flat(Infinity)
    .map((child) => find(child, predicate)).find(Boolean);
}

function text(tree) {
  if (tree == null || typeof tree === 'boolean') return '';
  if (typeof tree !== 'object') return String(tree);
  return [tree.props?.children].flat(Infinity).map(text).join('');
}

function fixture(info, options = {}) {
  const calls = { errors: [], info: [], modals: [], api: [], settings: [], restarts: 0 };
  const synchronized = options.synchronized ?? true;
  const settings = { liteMode: false, multiUser: false, enableStaking: true };
  const session = {
    stakeInfoQuery: { use: () => info },
    userStatusQuery: { valueAtom: 'userStatus' },
  };
  const dependencies = {
    '@emotion/styled': { __esModule: true, default: styled },
    'components/Button': 'Button',
    'components/AdjustStakeModal': 'AdjustStakeModal',
    'components/Dialogs/ConfirmDialog': 'ConfirmDialog',
    'components/QuestionCircle': 'QuestionCircle',
    'lib/store': { store: { get: (key) => key === 'settings' ? settings : { unlocked: { staking: false } } } },
    'lib/settings': { settingsAtom: 'settings', updateSettings: async (value) => calls.settings.push(value) },
    'lib/core': { restartCore: async () => { calls.restarts++; } },
    'lib/session': session,
    'lib/api': { callAPI: async (...args) => { calls.api.push(args); } },
    'lib/coreInfo': {
      useCoreInfo: () => ({}),
      useSynchronized: () => synchronized,
      isSynchronized: () => synchronized,
    },
    'lib/ui': {
      openModal: (component, props) => {
        calls.modals.push({ component, props });
        if (component === 'AdjustStakeModal' && props.onComplete) props.onComplete();
        return 'modal';
      },
      removeModal() {},
      showNotification() {},
    },
    'lib/dialog': {
      confirm: async () => true,
      confirmPin: async () => options.pin === undefined ? '1234' : options.pin,
      openInfoDialog: (value) => calls.info.push(value),
      openErrorDialog: (value) => calls.errors.push(value),
    },
    'lib/intl': { formatNumber: (number) => String(number), formatDateTime: String },
    './atoms': { useUserTab() {} },
    './TabContentWrapper': 'TabContentWrapper',
    'lib/usageTracking': { StartStake() {}, StopStake() {} },
  };
  const staking = loadModule('src/App/UserPage/Staking.tsx', dependencies).default;
  const header = loadModule('src/App/Header/StatusIconsTritium/StakingStatus.tsx', {
    'react-router': { Link: 'Link' },
    'components/Tooltip': { Trigger: 'Tooltip' },
    'components/Icon': 'Icon',
    'lib/coreInfo': dependencies['lib/coreInfo'],
    'lib/session': session,
    'lib/intl': dependencies['lib/intl'],
    'icons/staking.svg': '',
    './StatusIcon': 'StatusIcon',
  }).default;
  return { calls, render: () => staking(), header: () => header() };
}

function stake(overrides = {}) {
  return {
    balance: 10, stake: 20, new: false, staking: false, change: false,
    stakerate: 1, trustweight: 1, blockweight: 1, stakeweight: 1,
    ...overrides,
  };
}

function button(tree, label) {
  const found = find(tree, (element) => element.type === 'Button' && text(element) === label);
  assert.ok(found, `Missing button ${label}`);
  return found;
}

test('pending stake displays the signed change rather than available balance', () => {
  for (const amount of [5, -5]) {
    const tree = fixture(stake({ balance: 40, change: true, amount })).render();
    assert.match(text(tree), new RegExp(`Pending change${amount > 0 ? '\\+' : '-'}5 NXS`));
  }
  assert.match(text(fixture(stake({ change: true })).render()), /Pending changeUnavailable/);
});

test('starting permits locked stake without available balance and rejects an empty trust account', async () => {
  const locked = fixture(stake({ balance: 0, stake: 20 }));
  await button(locked.render(), 'Start staking').props.onClick();
  assert.equal(locked.calls.errors.length, 0);
  assert.equal(locked.calls.api[0][0], 'sessions/unlock/local');
  assert.equal(locked.calls.modals.length, 0);

  const empty = fixture(stake({ balance: 0, stake: 0 }));
  await button(empty.render(), 'Start staking').props.onClick();
  assert.equal(empty.calls.errors[0].message, 'Trust balance empty!');
  assert.equal(empty.calls.api.length, 0);
});

test('existing accounts without stake request an amount unless an increase is already pending', async () => {
  const missing = fixture(stake({ stake: 0 }));
  await button(missing.render(), 'Start staking').props.onClick();
  assert.equal(missing.calls.modals[0].component, 'AdjustStakeModal');
  assert.equal(missing.calls.api.length, 1);

  const pending = fixture(stake({ stake: 0, change: true, amount: 5 }));
  await button(pending.render(), 'Start staking').props.onClick();
  assert.equal(pending.calls.modals.length, 0);
  assert.equal(pending.calls.api.length, 1);
});

test('stopping warns whenever stake remains locked, even with an available balance', async () => {
  const locked = fixture(stake({ staking: true, balance: 10, stake: 20 }));
  await button(locked.render(), 'Stop staking').props.onClick();
  assert.equal(locked.calls.modals[0].component, 'ConfirmDialog');
  assert.match(locked.calls.modals[0].props.note, /still stay locked/);
  assert.equal(locked.calls.restarts, 0);

  const unlocked = fixture(stake({ staking: true, balance: 10, stake: 0 }));
  await button(unlocked.render(), 'Stop staking').props.onClick();
  assert.equal(unlocked.calls.modals.length, 0);
  assert.equal(unlocked.calls.settings[0].enableStaking, false);
  assert.equal(unlocked.calls.restarts, 1);
});

test('cancelled PIN does not claim that staking will start', async () => {
  const cancelled = fixture(stake(), { synchronized: false, pin: '' });
  await button(cancelled.render(), 'Start staking').props.onClick();
  assert.equal(cancelled.calls.api.length, 0);
  assert.equal(cancelled.calls.info.length, 0);
});

test('header and tab agree on synchronization and stalled minter states', () => {
  for (const [info, synchronized, message] of [
    [stake({ staking: true }), false, 'Waiting for synchronization to start staking'],
    [stake({ staking: true, stalled: true }), true, 'Staking minter is unresponsive'],
  ]) {
    const f = fixture(info, { synchronized });
    assert.match(text(f.render()), new RegExp(message));
    assert.equal(f.header().props.tooltip, message);
    assert.equal(find(f.header(), (element) => element.type === 'Icon').props.style.opacity, 0.7);
  }
  assert.equal(fixture(null).header().props.tooltip, 'Staking status unavailable');
});
