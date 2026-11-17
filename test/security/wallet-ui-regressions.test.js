'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { atom, createStore } = require('jotai');
const loadModule = require('../helpers/load-module');

function hookHarness() {
  let active;
  const react = {
    useRef(initial) {
      const index = active.index++;
      return active.slots[index] ||= { current: initial };
    },
    useMemo(callback, dependencies) {
      const index = active.index++;
      const previous = active.slots[index];
      if (!previous || dependencies.some((value, i) => value !== previous.dependencies[i])) {
        active.slots[index] = { value: callback(), dependencies };
      }
      return active.slots[index].value;
    },
    useCallback(callback, dependencies) {
      return react.useMemo(() => callback, dependencies);
    },
    useEffect(callback, dependencies) {
      const index = active.index++;
      const previous = active.slots[index];
      if (!previous || dependencies.some((value, i) => value !== previous.dependencies[i])) {
        previous?.cleanup?.();
        active.slots[index] = { dependencies, cleanup: callback() };
      }
    },
    useState(initial) {
      const index = active.index++;
      const state = active.slots[index] ||= { value: initial };
      return [state.value, (value) => {
        state.value = typeof value === 'function' ? value(state.value) : value;
      }];
    },
  };
  return {
    react,
    instance() {
      const state = { slots: [], index: 0 };
      return {
        render(component, props) {
          active = state;
          state.index = 0;
          return component(props);
        },
        unmount() { state.slots.forEach((slot) => slot.cleanup?.()); },
      };
    },
  };
}

const styled = new Proxy(() => () => 'styled', {
  get: () => () => 'styled',
});

function findElement(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (predicate(tree)) return tree;
  return [tree.props?.children].flat(Infinity)
    .map((child) => findElement(child, predicate)).find(Boolean);
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}

const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('virtual keyboard delivers text to the current field handler and unsubscribes', () => {
  const hooks = hookHarness();
  let listener;
  let closed;
  let unsubscribed = 0;
  const received = [];
  const module = loadModule('src/shared/components/TextFieldWithKeyboard.tsx', {
    react: hooks.react,
    'components/TextField': { TextField: 'TextField', MultilineTextField: 'MultilineTextField' },
    'components/Tooltip': { Trigger: 'Tooltip' },
    'components/Icon': 'Icon',
    'components/Button': 'Button',
    'lib/theme': { themeAtom: {} },
    'lib/store': { store: { get: () => ({}) } },
    'icons/keyboard.svg': '',
    './MaskableTextField': 'MaskableTextField',
  }, { __: (text) => text, window: { nexusElectron: { app: {
    onKeyboardInputChange(callback) {
      listener = callback;
      return () => { unsubscribed++; };
    },
    onceKeyboardClosed(callback) { closed = callback; },
    openVirtualKeyboard: async () => {},
  } } } });
  const instance = hooks.instance();
  const tree = instance.render(module.TextFieldWithKeyboard, {
    value: '', onChange: (value) => received.push(['old', value]),
  });
  findElement(tree.props.left, (element) => element.type === 'Button').props.onClick();
  listener('abc');
  instance.render(module.TextFieldWithKeyboard, {
    value: 'abc', onChange: (value) => received.push(['new', value]),
  });
  listener('abcd');
  assert.deepEqual(received, [['old', 'abc'], ['new', 'abcd']]);
  closed();
  instance.unmount();
  assert.equal(unsubscribed, 1);
});

test('Core settings initialize the binary override and allow resetting it to bundled', async () => {
  const formComponent = Object.assign(() => {}, { SubmitButton: 'SubmitButton' });
  let settings = { embeddedCoreBinaryPath: '/selected/core', manualDaemon: false };
  const coreSettings = loadModule('src/App/Settings/Core/index.tsx', {
    react: { useId: () => 'id', useState: (value) => [value, () => {}] },
    jotai: { useAtomValue: () => settings },
    '@emotion/styled': { __esModule: true, default: styled },
    'components/Form': formComponent,
    'components/Button': 'Button',
    'components/Switch': 'Switch',
    'lib/ui': {}, 'lib/dialog': {}, 'lib/core': {}, 'lib/coreInfo': {},
    'lib/settings': { settingsAtom: {} },
    'lib/form': { formSubmit: (value) => value },
    '../atoms': { useSettingsTab: () => {} },
    './EmbeddedCoreSettings': 'EmbeddedCoreSettings',
    './RemoteCoreSettings': 'RemoteCoreSettings',
  });
  const initialValues = () => findElement(coreSettings.default(), (element) =>
    element.type === formComponent).props.initialValues;
  assert.equal(initialValues().embeddedCoreBinaryPath, '/selected/core');
  settings = { ...settings, embeddedCoreBinaryPath: '/another/core' };
  assert.equal(initialValues().embeddedCoreBinaryPath, '/another/core');

  let value = '/another/core';
  let selected = ['/selected/new-core'];
  const embedded = loadModule('src/App/Settings/Core/EmbeddedCoreSettings.tsx', {
    'react-final-form': { useField: (_name, config) => ({ input: {
      value,
      onChange: (next) => { value = config.parse(next); },
    } }) },
    'components/Form': formComponent,
    'components/SettingsField': 'SettingsField',
    'components/Button': 'Button',
    'components/Switch': 'Switch',
    'components/TextField': { TextField: 'TextField' },
    'lib/form': {}, 'lib/dialog': {}, 'lib/core': {},
    'lib/coreConfig': {}, 'consts/misc': {}, styles: { consts: { inputHeightEm: 2 } },
  }, { window: { nexusElectron: { dialogs: { selectCoreBinary: async () => selected } } } });
  const fieldElement = findElement(embedded.default(), (element) =>
    element.type?.name === 'CoreBinaryPathField');
  const renderField = () => fieldElement.type();
  let field = renderField();
  assert.equal(findElement(field, (element) => element.type === 'TextField').props.readOnly, true);
  await findElement(field, (element) => element.props?.children === 'Browse').props.onClick();
  assert.equal(value, '/selected/new-core');
  selected = undefined;
  await findElement(field, (element) => element.props?.children === 'Browse').props.onClick();
  assert.equal(value, '/selected/new-core');
  field = renderField();
  findElement(field, (element) => element.props?.children === 'Use bundled').props.onClick();
  assert.equal(value, '');
  assert.equal(findElement(renderField(), (element) =>
    element.props?.children === 'Use bundled').props.disabled, true);
});

test('fallback update notification opens the release from the configured fork', () => {
  let opened;
  const module = loadModule('src/shared/lib/updater/AutoUpdateBackgroundTask.tsx', {
    react: { useRef: (value) => ({ current: value }) },
    'components/BackgroundTask': 'BackgroundTask',
    'lib/ui': {}, 'lib/dialog': {},
  }, { window: { nexusElectron: { app: {
    openExternal: async (url) => { opened = url; },
  } } } });
  const task = module.default({ gitHub: true, version: 'v3.2.4' });
  task.props.onClick();
  assert.equal(opened, 'https://github.com/NamecoinGithub/NexusInterface/releases/tag/v3.2.4');
});

function recipientFixture() {
  const hooks = hookHarness();
  const lookups = [];
  const components = [
    'AddEditContactModal', 'AutoSuggest', 'Button', 'FormField', 'Icon',
    'NexusAddress', 'TokenName',
  ];
  const module = loadModule('src/App/Send/RecipientNameOrAddress.tsx', {
    ...Object.fromEntries(components.map((name) => [`components/${name}`, name])),
    ...Object.fromEntries(['address-book', 'plus', 'wallet', 'warning'].map((name) => [`icons/${name}.svg`, name])),
    react: hooks.react,
    '@emotion/styled': { __esModule: true, default: styled },
    jotai: { useAtomValue: () => [] },
    'react-final-form': {
      Field: 'Field',
      useField: () => ({ input: { value: '', onChange() {} }, meta: {} }),
    },
    'consts/misc': { addressRegex: /^address:/ },
    'lib/addressBook': {},
    'lib/api': {
      callAPI: (_endpoint, { name }) => {
        const request = { name, ...deferred() };
        lookups.push(request);
        return request.promise;
      },
    },
    'lib/form': { required: () => () => undefined, checkAll: () => () => undefined },
    'lib/send': { useSource: () => null },
    'lib/ui': {},
    'lib/user': { accountsQuery: { use: () => [] } },
    'utils/memoize': (fn) => fn,
    './RecipientAddress': 'RecipientAddress',
  }, { console: { error() {} } });
  const tree = hooks.instance().render(module.default, { parentFieldName: 'recipient' });
  const field = findElement(tree, (element) => element.type === 'Field');
  const adapter = field.props.render({ input: { value: '', onChange() {} }, meta: {} }).type;
  const addresses = [];
  const instance = () => {
    const renderer = hooks.instance();
    const setAddress = (address) => addresses.push(address);
    return {
      render(nameOrAddress, justSelected = false) {
        renderer.render(adapter, { nameOrAddress, justSelected, setAddress });
      },
      unmount: renderer.unmount,
    };
  };
  return { instance, addresses, lookups };
}

test('recipient lookup ignores an older success, failure, cleared input and unmounted field', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fixture = recipientFixture();
  const recipient = fixture.instance();
  recipient.render('alice');
  t.mock.timers.tick(500);
  recipient.render('bob');
  t.mock.timers.tick(500);
  fixture.lookups[1].resolve({ register: 'address:bob' });
  await flush();
  fixture.lookups[0].resolve({ register: 'address:alice' });
  await flush();
  assert.equal(fixture.addresses.at(-1), 'address:bob');
  assert.ok(!fixture.addresses.includes('address:alice'));

  recipient.render('carol');
  t.mock.timers.tick(500);
  recipient.render('address:direct');
  fixture.lookups[2].reject(new Error('old lookup failed'));
  await flush();
  assert.equal(fixture.addresses.at(-1), 'address:direct');

  recipient.render('dave');
  t.mock.timers.tick(500);
  recipient.render('');
  fixture.lookups[3].resolve({ register: 'address:dave' });
  await flush();
  assert.equal(fixture.addresses.at(-1), null);

  recipient.render('erin');
  t.mock.timers.tick(500);
  recipient.unmount();
  const before = fixture.addresses.length;
  fixture.lookups[4].resolve({ register: 'address:erin' });
  await flush();
  assert.equal(fixture.addresses.length, before);
});

test('each recipient has an independent debounce and selecting one never cancels another', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fixture = recipientFixture();
  const first = fixture.instance();
  const second = fixture.instance();
  first.render('alice');
  second.render('bob');
  first.render('selected', true);
  assert.deepEqual(fixture.lookups.map(({ name }) => name), ['selected']);
  t.mock.timers.tick(500);
  assert.deepEqual(fixture.lookups.map(({ name }) => name), ['selected', 'bob']);
  fixture.lookups.forEach((lookup) => lookup.resolve({ register: `address:${lookup.name}` }));
  await flush();
  assert.ok(fixture.addresses.includes('address:selected'));
  assert.ok(fixture.addresses.includes('address:bob'));
});

test('transaction address input debounces strings, clears the query and cancels pending input on selection', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const hooks = hookHarness();
  const renderer = hooks.instance();
  const queries = [];
  const setAddress = (query) => queries.push(query);
  let selectAddress;
  const module = loadModule('src/App/Transactions/Filters.tsx', {
    react: hooks.react,
    '@emotion/styled': { __esModule: true, default: styled },
    jotai: { useAtom: (key) => key === 'address' ? ['', setAddress] : [null, () => {}] },
    'lib/transactions': { addressQueryAtom: 'address' },
    'lib/ui': { openModal: (_component, { onSelect }) => { selectAddress = onSelect; } },
    'components/Select': 'Select',
    'components/TextField': { TextField: 'TextField' },
    'components/FormField': 'FormField',
    'components/Icon': 'Icon',
    'components/Button': 'Button',
    'components/Tooltip': { Trigger: 'Tooltip' },
    'icons/list.svg': '',
    'icons/search.svg': '',
    './SelectAddressModal': 'SelectAddressModal',
    'utils/universal': loadModule('src/shared/utils/universal.ts'),
  });
  const render = () => renderer.render(module.default, {});
  const change = (value) => {
    const input = findElement(render(), (element) => element.type === 'TextField');
    input.props.onChange({ target: { value } });
  };
  change('first');
  t.mock.timers.tick(250);
  change('second');
  t.mock.timers.tick(500);
  assert.deepEqual(queries, ['second']);
  change('');
  t.mock.timers.tick(500);
  assert.deepEqual(queries, ['second', '']);
  change('old typing');
  const input = findElement(render(), (element) => element.type === 'TextField');
  findElement(input.props.right, (element) => element.type === 'Button').props.onClick();
  selectAddress('selected');
  t.mock.timers.tick(500);
  assert.deepEqual(queries, ['second', '', 'selected']);
  change('removed');
  renderer.unmount();
  t.mock.timers.tick(500);
  assert.equal(queries.at(-1), 'selected');
});

test('every transaction filter resets pagination and clearing removes its address predicate', async () => {
  const requests = [];
  const transactions = loadModule('src/shared/lib/transactions.ts', {
    'lib/api': { callAPI: async (_endpoint, params) => { requests.push(params); return []; } },
    'lib/store': {},
    './session': { userGenesisAtom: atom('user'), loggedInAtom: atom(true) },
    'utils/jotaiQuery': (config) => config,
    'utils/misc': {},
    'lib/intl': {},
    'lib/ui': {},
    'lib/dialog': {},
    'components/TokenName': {},
  });
  const store = createStore();
  for (const [filter, value] of [
    [transactions.addressQueryAtom, 'address:abc'],
    [transactions.operationAtom, 'DEBIT'],
    [transactions.timeSpanAtom, 'week'],
    [transactions.addressQueryAtom, ''],
  ]) {
    store.set(transactions.pageAtom, 9);
    store.set(filter, value);
    assert.equal(store.get(transactions.pageAtom), 1);
    await transactions.transactionsQuery.getQueryConfig(store.get).queryFn();
  }
  assert.ok(requests[0].where.includes('address:abc'));
  assert.ok(!requests.at(-1).where.includes('address:abc'));
  assert.ok(requests.every(({ page }) => page === 0));
});

test('NXS account fiat amounts and labels agree, including when a market price is unavailable', () => {
  const hooks = hookHarness();
  let market = { price: 2, currency: 'USDT' };
  const converted = [];
  const module = loadModule('src/App/UserPage/Accounts/AccountHistoryModal.tsx', {
    react: hooks.react,
    jotai: { useAtom: () => [true, () => {}] },
    '@emotion/styled': { __esModule: true, default: styled },
    ...Object.fromEntries([
      'WaitingMessage', 'Table', 'ContractDetailsModal', 'FieldSet', 'Icon', 'TokenName',
    ].map((name) => [`components/${name}`, name])),
    'components/ControlledModal': { Header: 'Header', Body: 'Body' },
    'components/Link': { NativeLink: 'NativeLink' },
    'components/Tooltip': { Trigger: 'Tooltip' },
    'lib/api': { listAll: async () => [] },
    'lib/intl': {
      formatNumber: (value) => String(value),
      formatCurrency: (value) => { converted.push(value); return `fiat:${value}`; },
    },
    'lib/ui': {},
    'lib/market': { marketDataQuery: { use: () => market } },
    'lib/addressBook': {},
    'lib/form': {},
    'icons/address-book.svg': '',
    '../atoms': {},
    './utils': { totalBalance: (account) => account.balance },
  });
  const account = { token: '0', ticker: 'NXS', balance: 10 };
  const tree = hooks.instance().render(module.default, { account });
  const balance = findElement(tree, (element) => !!element.props?.legend);
  const toggle = findElement(balance.props.legend, (element) => element.type === 'NativeLink');
  assert.equal(toggle.props.children, 'USDT');
  assert.equal(converted[0], 20);
  market = undefined;
  converted.length = 0;
  const noPrice = hooks.instance().render(module.default, { account });
  const noPriceBalance = findElement(noPrice, (element) => !!element.props?.legend);
  assert.equal(findElement(noPriceBalance.props.legend, (element) =>
    element.type === 'NativeLink').props.children, 'NXS');
  assert.equal(converted.length, 0);
});

test('contract history retains NXS and token fractional precision in its displayed amount', () => {
  const module = loadModule('src/App/Transactions/Contract.tsx', {
    '@emotion/styled': { __esModule: true, default: styled },
    ...Object.fromEntries([
      'Tooltip', 'ContractDetailsModal', 'TransactionDetailsModal', 'Icon', 'TokenName',
    ].map((name) => [`components/${name}`, name])),
    'lib/ui': {},
    'lib/contextMenu': {},
    'lib/intl': {
      formatNumber: (value, maximumFractionDigits = 3) =>
        new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value),
    },
    'lib/transactions': { getDeltaSign: () => '-' },
    'lib/addressBook': {},
    'icons/wallet.svg': '',
    'icons/token.svg': '',
    'utils/color': {},
    styles: { timing: {}, consts: {} },
  });
  for (const [token, amount] of [['0', 1.234567], ['custom-token', 1.23456789]]) {
    const tree = module.default({ contract: { OP: 'FEE', token, amount }, txid: 'tx' });
    const delta = findElement(tree, (element) => element.props?.sign === '-');
    assert.equal(delta.props.children[0], String(amount));
  }
});
