const assert = require('assert/strict');
const fs = require('fs');
const vm = require('vm');
const babel = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Provider } = require('react-redux');
const { createStore } = require('redux');
const { ThemeProvider } = require('@emotion/react');
const styled = require('@emotion/styled').default;
function load(file, mocks = {}) {
  const module = { exports: {} };
  const code = babel.transformSync(fs.readFileSync(file, 'utf8'), {
    filename: file, configFile: false, babelrc: false,
    presets: [['@babel/preset-env', { targets: { node: 'current' } }], ['@babel/preset-react', { runtime: 'automatic' }]],
  }).code;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => mocks[name] || require(name), __context: () => text => text });
  return module.exports;
}
let saved;
const actions = [];
const theme = load('src/shared/lib/theme.js', {
  fs: { existsSync: () => saved !== undefined },
  'consts/actionTypes': { SET_THEME: 'set', UPDATE_THEME: 'update' },
  store: { dispatch: action => actions.push(action) },
  'consts/paths': { walletDataDir: '/test' },
  'utils/json': { readJson: () => saved, writeJson: (path, value) => { saved = value; } },
});
assert.equal(theme.loadTheme().modern, true, 'New installs default to Modern');
for (const preset of [theme.modernTheme, theme.darkTheme, theme.lightTheme, theme.nexusTheme]) {
  theme.setTheme(preset);
  assert.deepEqual(theme.loadTheme(), preset, 'Theme survives reload');
  assert.equal(actions.at(-1).payload, preset);
}
theme.setTheme(theme.modernTheme);
theme.updateTheme({ primary: '#123456' });
assert.equal(theme.loadTheme().modern, true);
theme.resetColors();
assert.deepEqual(theme.loadTheme(), theme.modernTheme);
theme.setTheme(theme.darkTheme);
theme.resetColors();
assert.deepEqual(theme.loadTheme(), theme.darkTheme);
saved = { primary: '#123456' };
assert.equal(theme.loadTheme().modern, undefined, 'Old custom themes retain classic styles');
const styles = load('src/shared/utils/themeStyles.js').default;
const Surface = styled.div(styles([{ padding: 4, position: 'fixed' }], [({ theme }) => ({ padding: 16, color: theme.primary })]));
const html = modern => renderToStaticMarkup(React.createElement(ThemeProvider, { theme: {modern, primary: '#123456'} }, React.createElement(Surface)));
assert.match(html(false), /position:fixed/);
assert.doesNotMatch(html(true), /position:fixed/);
assert.match(html(true), /padding:16px/);
const ThemePicker = load('src/App/Settings/Style/ThemePicker.js', {
  'lib/theme': theme,
  'components/Button': ({skin, children}) => React.createElement('button', {'data-skin':skin}, children),
}).default;
for (const [name, preset] of [['Modern',theme.modernTheme],['Dark',theme.darkTheme],['Light',theme.lightTheme],['Nexus.io',theme.nexusTheme]]) {
  const markup = renderToStaticMarkup(React.createElement(Provider, {store:createStore(() => ({theme:preset}))},React.createElement(ThemePicker)));
  assert.ok(markup.includes(`<button data-skin="filled-primary">${name}</button>`), name+' is selected correctly');
}
console.log('PASS: Modern default, all preset persistence, classic compatibility, color reset, style isolation, and theme picker selection.');
