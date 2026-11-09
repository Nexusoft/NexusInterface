'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const babel = require('@babel/core');

module.exports = function loadModule(relativePath, overrides = {}, globals = {}) {
  const filename = path.resolve(__dirname, '../..', relativePath);
  const compiled = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false,
    configFile: false,
    filename,
    presets: [
      [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
      ...(/\.tsx?$/.test(filename) ? [require.resolve('@babel/preset-typescript')] : []),
      ...(filename.endsWith('.tsx') ? [[require.resolve('@babel/preset-react'), { runtime: 'automatic' }]] : []),
    ],
  }).code;
  const originalRequire = createRequire(filename);
  const localRequire = (name) =>
    Object.prototype.hasOwnProperty.call(overrides, name)
      ? overrides[name]
      : originalRequire(name);
  const scope = {
    __: undefined,
    __context: () => (text) => text,
    ...globals,
  };
  const module = { exports: {} };
  new Function('require', 'module', 'exports', ...Object.keys(scope), compiled)(
    localRequire, module, module.exports, ...Object.values(scope)
  );
  return module.exports;
};
