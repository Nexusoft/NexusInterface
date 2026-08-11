'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { CHANNELS } = require('../../src/main/ipc/contracts');

const mainSource = fs.readFileSync(
  path.resolve(__dirname, '../../src/main/main.js'),
  'utf8'
);

function channelPaths(value, prefix = 'CHANNELS') {
  return Object.entries(value).flatMap(([name, child]) => {
    const childPath = `${prefix}.${name}`;
    return typeof child === 'string' ? [childPath] : channelPaths(child, childPath);
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('every declared privileged channel has a validated main-process handler', () => {
  assert.equal(
    [...mainSource.matchAll(/\bipcMain\.(?:handle|on)\(/g)].length,
    2,
    'IPC registration must remain inside the guarded registration helpers'
  );
  assert.match(mainSource, /function registerOperation\(channel, validateRequest, operation\)/);
  assert.match(mainSource, /function registerSynchronousOperation\(channel, validateRequest, operation\)/);
  assert.match(mainSource, /validateRequest\s*\?\s*validateRequest\(request, event\)\s*:\s*validateNoArguments/);
  assert.match(mainSource, /if \(!isMainWindowSender\(event\)\) return senderError\(\)/);

  for (const channelPath of channelPaths(CHANNELS)) {
    assert.match(
      mainSource,
      new RegExp(
        `register(?:Synchronous)?Operation\\s*\\(\\s*${escapeRegExp(channelPath)}\\s*,`
      ),
      `${channelPath} has no registered handler`
    );
  }
});
