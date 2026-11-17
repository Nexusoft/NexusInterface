'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');
const loadModule = require('../helpers/load-module');

function keyboardPreload() {
  const ipcRenderer = new EventEmitter();
  const exposed = {};
  loadModule('src/keyboard/preload.js', {
    electron: {
      ipcRenderer,
      contextBridge: { exposeInMainWorld: (name, value) => { exposed[name] = value; } },
    },
  });
  return { ipcRenderer, keyboard: exposed.virtualKeyboard };
}

for (const early of [true, false]) {
  test(`keyboard delivers options ${early ? 'before' : 'after'} the renderer subscribes`, () => {
    const { ipcRenderer, keyboard } = keyboardPreload();
    const options = { defaultText: 'abc', maskable: true, placeholder: '' };
    const received = [];
    if (early) ipcRenderer.emit('options', {}, options);
    keyboard.onOptions((value) => received.push(value));
    if (!early) ipcRenderer.emit('options', {}, options);
    assert.deepEqual(received, [options]);
  });
}
