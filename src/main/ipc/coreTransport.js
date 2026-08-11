'use strict';

const net = require('net');

function normalizeHost(host) {
  if (typeof host !== 'string') return '';
  const value = host.trim();
  return value.startsWith('[') && value.endsWith(']')
    ? value.slice(1, -1)
    : value;
}

function isLoopbackHost(host) {
  const normalizedHost = normalizeHost(host);
  if (net.isIP(normalizedHost) === 4) {
    return normalizedHost.startsWith('127.');
  }
  return (
    normalizedHost === '::1' ||
    normalizedHost === '0:0:0:0:0:0:0:1' ||
    normalizedHost === '::ffff:127.0.0.1'
  );
}

function getCoreTransportOptions(config) {
  const apiSSL = config?.apiSSL === true;
  const isLocal = isLoopbackHost(config?.ip);
  if (!apiSSL && !isLocal) {
    throw new Error(
      'Remote Core endpoints require TLS; insecure transport is allowed only for literal loopback addresses'
    );
  }
  return {
    apiSSL,
    rejectUnauthorized: !isLocal,
  };
}

function validateCoreRpcPath(value) {
  if (typeof value !== 'string' || !value || value.length > 2048) {
    throw new Error('Core RPC URL is invalid');
  }
  const normalizedPath = value.replace(/^\/+/, '');
  if (!normalizedPath) {
    throw new Error('Core RPC URL is invalid');
  }
  if (
    normalizedPath.includes('://') ||
    normalizedPath.includes('\\') ||
    normalizedPath.split('/').some((segment) => {
      try {
        const decoded = decodeURIComponent(segment);
        return (
          decoded === '..' ||
          decoded === '.' ||
          decoded.includes('/') ||
          decoded.includes('\\')
        );
      } catch {
        return true;
      }
    })
  ) {
    throw new Error('Core RPC URL must be a relative API path');
  }
  return normalizedPath;
}

module.exports = {
  getCoreTransportOptions,
  isLoopbackHost,
  validateCoreRpcPath,
};
