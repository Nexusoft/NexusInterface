import fs from 'fs';
import path from 'path';

import { loadSettingsFromFile } from './settings';
import { EVENTS } from './ipc/contracts';

const subscriptions = new Map();

function getCoreLogPath() {
  const settings = loadSettingsFromFile();
  const testnet =
    settings.testnetIteration && String(settings.testnetIteration) !== '0'
      ? `testnet${settings.testnetIteration}`
      : undefined;
  return path.join(
    settings.coreDataDir,
    ...(testnet ? [testnet] : []),
    ...(settings.liteMode ? ['client'] : []),
    'log',
    '0.log'
  );
}

function stopCoreOutput(webContentsId) {
  const subscription = subscriptions.get(webContentsId);
  if (!subscription) return;
  subscription.stop();
  fs.unwatchFile(subscription.logPath, subscription.listener);
  subscriptions.delete(webContentsId);
  console.info('core.output.stop', {
    webContentsId,
    logPath: subscription.logPath,
  });
}

function startCoreOutput(webContents) {
  stopCoreOutput(webContents.id);
  const logPath = getCoreLogPath();
  let position = 0;
  let reading = false;
  let active = true;
  let pending = false;
  let generation = 0;
  let observed;
  let pathExists = false;
  const readPending = () => {
    if (!active || reading || !observed || observed.size <= position) return;
    pending = false;
    const start = position;
    const end = observed.size;
    const readGeneration = generation;
    reading = true;
    const stream = fs.createReadStream(logPath, {
      start,
      end: end - 1,
    });
    const chunks = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    stream.once('error', (error) => {
      reading = false;
      console.warn('core.output.read.failed', {
        logPath,
        message: error?.message || String(error),
      });
      if (pending) readPending();
    });
    stream.once('end', () => {
      reading = false;
      if (active && readGeneration === generation) {
        const output = Buffer.concat(chunks);
        position = start + output.length;
        const lines = output
          .toString('utf8')
          .split(/\r?\n/)
          .filter(Boolean)
          .slice(-1000);
        if (lines.length && !webContents.isDestroyed()) {
          webContents.send(EVENTS.coreOutput, lines);
        }
      }
      if (pending) readPending();
    });
  };
  const listener = (current) => {
    if (
      observed &&
      (current.dev !== observed.dev ||
        current.ino !== observed.ino ||
        current.size < observed.size ||
        current.size < position)
    ) {
      position = 0;
      generation++;
    }
    observed = current;
    pending = true;
    readPending();
  };

  try {
    observed = fs.statSync(logPath);
    position = observed.size;
    pathExists = true;
  } catch {
    position = 0;
    pathExists = false;
  }

  if (!pathExists) {
    console.warn('core.output.path_missing', { logPath });
  } else {
    console.info('core.output.path_ready', { logPath, position });
  }

  fs.watchFile(logPath, { interval: 1000 }, listener);
  subscriptions.set(webContents.id, {
    logPath,
    listener,
    stop: () => {
      active = false;
    },
  });
  webContents.once('destroyed', () => stopCoreOutput(webContents.id));
}

export function subscribeCoreOutput(webContents) {
  console.info('core.output.subscribe', { webContentsId: webContents?.id });
  startCoreOutput(webContents);
  return { subscribed: true, logPath: getCoreLogPath() };
}

export function unsubscribeCoreOutput(webContents) {
  stopCoreOutput(webContents.id);
  return { subscribed: false };
}
