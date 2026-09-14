'use strict';

function normalizeWindowUrl(value) {
  const parsed = new URL(value);
  if (parsed.username || parsed.password) {
    throw new TypeError('Window URL must not contain credentials');
  }
  parsed.hash = '';
  return parsed.toString();
}

function isTrustedWindowUrl(value, trustedUrl) {
  try {
    return normalizeWindowUrl(value) === normalizeWindowUrl(trustedUrl);
  } catch {
    return false;
  }
}

module.exports = {
  isTrustedWindowUrl,
  normalizeWindowUrl,
};
