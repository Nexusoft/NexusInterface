'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');
const loadModule = require('../helpers/load-module');

function createHarness(initial) {
  let listener;
  const streams = [];
  const sent = [];
  const fs = {
    statSync: () => initial,
    watchFile: (_path, _options, callback) => { listener = callback; },
    unwatchFile: () => {},
    createReadStream: (_path, options) => {
      const stream = new EventEmitter();
      streams.push({ stream, ...options });
      return stream;
    },
  };
  const output = loadModule('src/main/coreOutput.js', {
    fs,
    './settings': { loadSettingsFromFile: () => ({ coreDataDir: '/core' }) },
  });
  const webContents = {
    id: 1,
    once: () => {},
    isDestroyed: () => false,
    send: (_event, lines) => sent.push(lines),
  };
  output.subscribeCoreOutput(webContents);
  const finish = (index, value) => {
    streams[index].stream.emit('data', Buffer.from(value));
    streams[index].stream.emit('end');
  };
  return { listener: (stats) => listener(stats), streams, sent, finish, output, webContents };
}

test('Core output reads shorter truncated and replaced logs from the beginning', () => {
  const h = createHarness({ dev: 1, ino: 1, size: 20 });
  h.listener({ dev: 1, ino: 1, size: 5 });
  assert.deepEqual([h.streams[0].start, h.streams[0].end], [0, 4]);
  h.finish(0, 'new!\n');
  h.listener({ dev: 1, ino: 2, size: 7 });
  assert.deepEqual([h.streams[1].start, h.streams[1].end], [0, 6]);
  h.finish(1, 'rotate\n');
  assert.deepEqual(h.sent, [['new!'], ['rotate']]);
});

test('Core output processes updates arriving during a read and discards stale rotations', () => {
  const h = createHarness({ dev: 1, ino: 1, size: 4 });
  h.listener({ dev: 1, ino: 1, size: 8 });
  h.listener({ dev: 1, ino: 1, size: 12 });
  h.finish(0, 'one\n');
  assert.deepEqual([h.streams[1].start, h.streams[1].end], [8, 11]);
  h.listener({ dev: 1, ino: 2, size: 5 });
  h.finish(1, 'old\n');
  assert.deepEqual([h.streams[2].start, h.streams[2].end], [0, 4]);
  h.finish(2, 'new!\n');
  assert.deepEqual(h.sent, [['one'], ['new!']]);
  h.output.unsubscribeCoreOutput(h.webContents);
  h.listener({ dev: 1, ino: 2, size: 10 });
  assert.equal(h.streams.length, 3);
});

test('Core output retries a failed read without advancing its offset', () => {
  const h = createHarness({ dev: 1, ino: 1, size: 4 });
  h.listener({ dev: 1, ino: 1, size: 8 });
  h.streams[0].stream.emit('error', new Error('read failed'));
  h.listener({ dev: 1, ino: 1, size: 12 });
  assert.deepEqual([h.streams[1].start, h.streams[1].end], [4, 11]);
  h.finish(1, 'one\ntwo\n');
  assert.deepEqual(h.sent, [['one', 'two']]);
});
