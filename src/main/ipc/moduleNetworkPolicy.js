'use strict';

const path = require('path');

function isPathInside(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function getProductionPrefix(moduleName, fileServerDomain) {
  const origin = new URL(fileServerDomain);
  return {
    origin: origin.origin,
    pathname: `/modules/${encodeURIComponent(moduleName)}/`,
  };
}

function isAllowedModuleRequest(url, policy, fileServerDomain) {
  let target;
  try {
    target = new URL(url);
  } catch {
    return false;
  }

  if (target.protocol === 'data:' || target.protocol === 'blob:') {
    return true;
  }
  if (target.protocol === 'about:') {
    return target.href === 'about:blank';
  }

  if (target.protocol !== 'http:') return false;
  const prefix = getProductionPrefix(policy.moduleName, fileServerDomain);
  return (
    target.origin === prefix.origin && target.pathname.startsWith(prefix.pathname)
  );
}

function getModuleProxyConfig(policy, fileServerDomain) {
  const bypassRules = ['<-loopback>'];
  bypassRules.push(new URL(fileServerDomain).host);
  return {
    mode: 'fixed_servers',
    proxyRules: 'http=127.0.0.1:9;https=127.0.0.1:9',
    proxyBypassRules: bypassRules.join(','),
  };
}

module.exports = {
  getModuleProxyConfig,
  isAllowedModuleRequest,
  isPathInside,
};
