'use strict';

const path = require('path');

function splitCommandParts(command) {
  const parts = [];
  let current = '';
  let quote = null;
  let started = false;

  for (const char of String(command || '')) {
    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      started = true;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) {
        parts.push(current);
        current = '';
        started = false;
      }
    } else {
      current += char;
      started = true;
    }
  }

  if (started) parts.push(current);
  return parts;
}

function normalizeProcessPath(value, platform = process.platform) {
  if (typeof value !== 'string') return '';
  let raw = value.trim().replace(/^(['"])(.*)\1$/, '$2').trim();
  if (!raw) return '';

  const pathApi = platform === 'win32' ? path.win32 : path;
  if (platform === 'win32') raw = raw.replace(/\//g, '\\');
  let normalized = pathApi.normalize(raw);
  const root = pathApi.parse(normalized).root;
  while (normalized.length > root.length && /[\\/]$/.test(normalized)) {
    normalized = normalized.slice(0, -1);
  }
  return platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function commandUsesDataDir(command, dataDir, platform = process.platform) {
  const normalizedDataDir = normalizeProcessPath(dataDir, platform);
  if (!command || !normalizedDataDir) return false;

  const rawCommand = String(command);
  const dataDirFlag = /(?:^|\s)(["']?)[-/]datadir=/gi;
  let match;
  while ((match = dataDirFlag.exec(rawCommand))) {
    const valueStart = match.index + match[0].length;
    for (
      let valueEnd = valueStart + 1;
      valueEnd <= rawCommand.length;
      valueEnd++
    ) {
      if (
        valueEnd === rawCommand.length ||
        /\s/.test(rawCommand[valueEnd])
      ) {
        let value = rawCommand.slice(valueStart, valueEnd);
        const hasClosingQuote = match[1] && value.endsWith(match[1]);
        if (hasClosingQuote) {
          value = value.slice(0, -1);
        }
        const hasArgumentBoundary =
          valueEnd === rawCommand.length ||
          hasClosingQuote ||
          /^\s*(?:[-/]|$)/.test(rawCommand.slice(valueEnd));
        if (
          hasArgumentBoundary &&
          normalizeProcessPath(value, platform) === normalizedDataDir
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function argvUsesDataDir(argv, dataDir, platform = process.platform) {
  const normalizedDataDir = normalizeProcessPath(dataDir, platform);
  return Boolean(
    normalizedDataDir &&
      Array.isArray(argv) &&
      argv.some((argument) => {
        const match = String(argument).match(/^[-/]datadir=(.*)$/i);
        return (
          match && normalizeProcessPath(match[1], platform) === normalizedDataDir
        );
      })
  );
}

module.exports = {
  argvUsesDataDir,
  commandUsesDataDir,
  normalizeProcessPath,
  splitCommandParts,
};
