'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  assertCoreConsoleAllowed,
} = require('../../src/main/ipc/coreConsolePolicy');

test('Core console requires persisted Developer mode policy', () => {
  for (const settings of [
    undefined,
    {},
    { devMode: false },
    { devMode: 1 },
    { allowAdvancedCoreOptions: true },
  ]) {
    assert.throws(() => assertCoreConsoleAllowed(settings), /Developer mode/);
  }

  assert.doesNotThrow(() => assertCoreConsoleAllowed({ devMode: true }));
});

test('both Core console IPC handlers enforce the persisted policy', () => {
  const mainSource = fs.readFileSync(
    path.resolve(__dirname, '../../src/main/main.js'),
    'utf8'
  );

  for (const channel of [
    'CHANNELS.core.executeConsoleCommand',
    'CHANNELS.coreRpc.callByUrl',
  ]) {
    assert.match(
      mainSource,
      new RegExp(
        `${channel.replaceAll('.', '\\.')}[\\s\\S]*?assertCoreConsoleAllowed\\(loadSettingsFromFile\\(\\)\\)[\\s\\S]*?\\n\\s*\\}`
      )
    );
  }
});
