const assert = require('assert/strict');
const fs = require('fs');
const vm = require('vm');
const babel = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { ThemeProvider } = require('@emotion/react');

function load(file, mocks = {}) {
  const module = { exports: {} };
  const code = babel.transformSync(fs.readFileSync(file, 'utf8'), {
    filename: file, configFile: false, babelrc: false,
    presets: [['@babel/preset-env', { targets: { node: 'current' } }], ['@babel/preset-react', { runtime: 'automatic' }]],
  }).code;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => mocks[name] || require(name), __context: () => text => text });
  return module.exports;
}
const helpers = load('src/App/Staking/dashboardData.js');
const { stakingStatus, rankingPosition, finite } = helpers;
const enabled = { enableStaking: true };
assert.equal(stakingStatus({ staking: true }, null, enabled), 'offline');
assert.equal(stakingStatus({}, {}, enabled), 'unavailable');
assert.equal(stakingStatus({ staking: true }, { syncing: true }, enabled), 'syncing');
assert.equal(stakingStatus({ staking: true }, {}, enabled, { unlocked: { staking: false } }), 'locked');
assert.equal(stakingStatus({ staking: true, onhold: true }, {}, enabled), 'hold');
assert.equal(stakingStatus({ staking: true }, {}, enabled), 'on');
assert.equal(stakingStatus({ staking: false }, {}, enabled), 'off');
assert.equal(stakingStatus({ staking: true }, {}, { liteMode: true, ...enabled }), 'off');
assert.equal(stakingStatus({ staking: true }, {}, { enableStaking: false }), 'off');
assert.equal(rankingPosition([{ address: 'a' }, { address: 'b' }], 'b'), 2);
assert.equal(rankingPosition([{ address: 'a' }], 'absent'), null);
assert.equal(rankingPosition([], 'a'), null);
assert.throws(() => rankingPosition({ error: 'gateway' }, 'a'));
assert.throws(() => rankingPosition([{}], 'a'));
assert.equal(finite(0), true);
for (const missing of [undefined, null, NaN, Infinity, '']) assert.equal(finite(missing), false);

let state;
const Dashboard = load('src/App/Staking/StakingDashboard.js', {
  'utils/moduleStyles': load('src/shared/utils/moduleStyles.js', { './color': load('src/shared/utils/color.js') }),
  'utils/color': load('src/shared/utils/color.js'),
  'react-redux': { useSelector: fn => fn(state) },
  'components/Button': ({ children, skin, ...props }) => React.createElement('button', props, children),
  'components/AdjustStakeModal': () => null,
  'lib/ui': { openModal() {} },
  'lib/intl': { formatNumber: (n, digits) => n.toFixed(digits), formatDateTime: n => new Date(n).toISOString() },
  './ExplorerRankings': () => null,
  './dashboardData': helpers,
}).default;
for (const modern of [true, false]) {
  for (const info of [{}, { staking: false, stake: 0, balance: 0, trust: 0, stakerate: 0.5 }, { staking: true, stake: 123, trust: 456, change: true, amount: -23, requested: 1700000000, blockweight: 110 }]) {
    state = { user: { stakeInfo: info, status: {} }, core: { systemInfo: {} }, settings: enabled };
    const html = renderToStaticMarkup(React.createElement(ThemeProvider, { theme: { modern, primary: '#08c', background: '#15191c', foreground: '#fff', mixer: () => '#555' } }, React.createElement(Dashboard)));
    assert.doesNotMatch(html, /NaN|undefined/);
    assert.match(html, /Staking weights/);
    if (info.trust === 0) assert.match(html, /metric-value[^>]*>0</);
    if (info.change) { assert.match(html, /-23.000000 NXS/); assert.match(html, /value="100"/); }
  }
}
console.log('PASS: staking readiness, missing and zero metrics, bounded ranking positions, malformed explorer data, pending changes, and dashboard rendering in modern/classic themes.');
