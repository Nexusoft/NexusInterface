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
  vm.runInNewContext(code, { module, exports: module.exports, require: name => mocks[name] || require(name) });
  return module.exports;
}
const color = load('src/shared/utils/color.js');
const buttons = load('src/shared/utils/buttonStyles.js', { './color': color });
const tokens = load('src/shared/utils/modalStyles.js', { './color': color, './buttonStyles': buttons });
const mocks = {
  'utils/color': color, 'utils/modalStyles': tokens, 'utils/buttonStyles': buttons,
  styles: { timing: { quick: '150ms', normal: '200ms' } },
  'utils/misc': { refs: () => undefined },
  'components/Overlay': ({ children }) => React.createElement(React.Fragment, null, children),
  'utils/themeStyles': load('src/shared/utils/themeStyles.js').default,
};
const Modal = load('src/shared/components/Modal.js', mocks).default;
const Button = load('src/shared/components/Button.js', mocks).default;
const base = { primary: '#00bbee', primaryAccent: '#000000', background: '#1b2023', foreground: '#eeeeee', danger: '#ff4444', mixer: () => '#aaaaaa', lower: x => x, raise: x => x };
function render(modern, extra = {}) {
  return renderToStaticMarkup(React.createElement(ThemeProvider, { theme: { ...base, modern } },
    React.createElement(Modal, { visible: true, ...extra },
      React.createElement(Modal.Header, null, 'Title'),
      React.createElement(Modal.Body, null,
        React.createElement(Button, { skin: 'primary' }, 'Save'),
        React.createElement(Button, { skin: 'filled-danger' }, 'Delete'),
        React.createElement(Button, { square: true }, 'Icon'),
        React.createElement(Button, { skin: 'link' }, 'Link')))));
}
const modern = render(true);
assert.match(modern, /data-wallet-field/);
assert.match(modern, /data-field-error/);
assert.match(modern, /data-multiline/);
assert.match(modern, /padding:20px 24px/);
assert.match(modern, /minmax\(0, 1fr\)/);
assert.match(modern, /max-width:\s*480px/);
assert.equal((modern.match(/data-modal-action="true" class=/g) || []).length, 2, 'Only full action buttons receive uniform sizing');
assert.doesNotMatch(render(false), /data-wallet-field/,'Classic fields retain their original styling');
assert.equal(render(true, { visible: false }), '', 'Hidden modals stay hidden');
assert.match(render(true, { fullScreen: true }), /max-height:none/, 'Fullscreen behavior remains available');
console.log('PASS: Modern modal styling, classic isolation, action exclusions, validation/multiline selectors, responsive and visibility behavior.');

for (const skin of ['default', 'primary', 'danger', 'filled-primary', 'filled-danger', 'filled-inverted']) {
  const props = {theme: {...base, modern: true}, skin};
  const css = buttons.modernButtonStyle(props)['&&&&'];
  assert.equal(css.minHeight, 38);
  assert.equal(css.borderRadius, 8);
  assert.equal(css.fontSize, 13);
  assert.equal(css.textTransform, 'none');
  assert.ok(css['&:focus-visible'].outline);
  assert.equal(css['&:disabled'].cursor, 'not-allowed');
  assert.equal(buttons.modernButtonStyle({...props, theme: {...base, modern: false}}), undefined);
}
assert.equal(buttons.modernButtonStyle({theme: {...base, modern: true}, skin: 'plain'})['&&&&'].width, 'auto');
assert.equal(buttons.modernButtonStyle({theme: {...base, modern: true}, skin: 'plain', square: true})['&&&&'].width, 28);
assert.equal(buttons.modernButtonStyle({theme: {...base, modern: true}, skin: 'default', fitHeight: true})['&&&&'].minHeight, 0);
assert.equal(buttons.modernButtonStyle({theme: {...base, modern: true}, skin: 'default', grouped: 'left'})['&&&&'].borderTopRightRadius, 0);
console.log('PASS: Uniform Modern actions, semantic variants, focus/disabled states, icon sizing, grouped controls, and classic isolation.');

const loginSized = render(true, { maxWidth: 460 });
for (const [margin, scale] of [[32, 0.9], [24, 0.85], [20, 0.75]]) {
  assert.ok(loginSized.includes(`min(460px, calc((100vw - ${margin}px) / ${scale}))`), 'Scaled dialogs preserve their explicit width cap');
}
console.log('PASS: login width cap is preserved at every modal scale.');
