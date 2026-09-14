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
  let pathExists = false;
  const listener = (current, previous) => {
    if (reading || current.size <= position) {
      if (current.size < position) position = current.size;
      return;
    }
    const start = position;
    position = current.size;
    reading = true;
    const stream = fs.createReadStream(logPath, {
      start,
      end: current.size - 1,
      encoding: 'utf8',
    });
    let output = '';
    stream.on('data', (chunk) => {
      output += chunk;
    });
    stream.once('error', (error) => {
      reading = false;
      console.warn('core.output.read.failed', {
        logPath,
        message: error?.message || String(error),
      });
    });
    stream.once('end', () => {
      reading = false;
      const lines = output.split(/\r?\n/).filter(Boolean).slice(-1000);
      if (!lines.length || webContents.isDestroyed()) return;
      webContents.send(EVENTS.coreOutput, lines);
    });
  };

  try {
    position = fs.statSync(logPath).size;
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
  subscriptions.set(webContents.id, { logPath, listener });
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
