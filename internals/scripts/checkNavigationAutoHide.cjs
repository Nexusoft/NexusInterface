const assert = require('assert/strict');
const vm = require('vm');
const babel = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { ThemeProvider } = require('@emotion/react');
const Color = require('color');
const state = { settings: {}, modules: {} };
const mocks = {
  'react-redux': { useSelector: selector => selector(state) },
  'components/Icon': () => null,
  'components/ModuleIcon': () => null,
  'components/HorizontalLine': () => null,
  'components/Tooltip': { Trigger: ({ children }) => children },
  selectors: { selectModuleUpdateCount: () => 0 },
  './NavLinkItem': ({ children, to, end, ...rest }) => React.createElement('a', { href: to, ...rest }, children),
  'utils/color': {
    fade: (color, amount) => Color(color).fade(amount).string(),
    mix: (first, second, amount) => Color(first).mix(Color(second), amount).string(),
  },
  'utils/themeStyles': (classic, modern) => props => (props.theme.modern ? modern : classic).map(style => typeof style === 'function' ? style(props) : style),
  styles: { consts: { enhancedEaseOut: 'ease-out' }, timing: { slow: '300ms' } },
};
const code = babel.transformFileSync('src/App/Navigation/index.js', {
  configFile: false, babelrc: false,
  presets: [['@babel/preset-env', { targets: { node: 'current' } }], ['@babel/preset-react', { runtime: 'automatic' }]],
}).code;
const mod = { exports: {} };
vm.runInNewContext(code, {
  module: mod, exports: mod.exports, __context: () => text => text,
  require: name => name.startsWith('icons/') ? {} : mocks[name] || require(name),
});
function render(modern, autoHide, expanded = false) {
  return renderToStaticMarkup(React.createElement(ThemeProvider, {
    theme: { modern, background: '#1c1d1f', primary: '#00b7fa' },
  }, React.createElement(mod.exports.default, { autoHide, expanded, onToggle() {} })));
}
const hidden = render(true, true);
assert.match(hidden, /aria-label="Show navigation"/);
assert.match(hidden, /translateX\(-100%\)/);
assert.match(hidden, /:hover>nav/);
assert.match(hidden, /:focus-within>nav/);
assert.match(hidden, /href="\/Settings"/);
assert.match(render(true, true, true), /width:208px/);
assert.doesNotMatch(render(true, false), /translateX\(-100%\)|aria-label="Show navigation"/);
assert.doesNotMatch(render(false, true), /translateX\(-100%\)|aria-label="Show navigation"/);
console.log('PASS: Modern menu reveal styles, keyboard access, expanded sizing, default and classic isolation.');
