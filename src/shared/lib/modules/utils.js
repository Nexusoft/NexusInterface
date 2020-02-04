import semver from 'semver';
import memoize from 'utils/memoize';

import store from 'store';

/**
 * Checkers
 * =============================================================================
 */

// Check if the Module API this module was built on is still supported
export const isModuleIncompatible = module =>
  !module.targetWalletVersion ||
  semver.lt(module.targetWalletVersion, BACKWARD_COMPATIBLE_VERSION);

// Check if a module is valid
export const isModuleDisallowed = module => {
  const {
    settings: { devMode, verifyModuleSource },
  } = store.getState();
  return !(
    (devMode && !verifyModuleSource) ||
    (module.repository && module.repoOnline && module.repoVerified)
  );
};

// Check if a module is active, which means it's valid and not disabled by user
export const isModuleEnabled = module => {
  const {
    settings: { disabledModules },
  } = store.getState();
  return !module.disallowed && !disabledModules.includes(module.name);
};

/**
 * Memoized getters
 * =============================================================================
 */

export const getAllModules = memoize(modules => Object.values(modules));

export const getActiveModules = memoize((modules, disabledModules) =>
  Object.values(modules).filter(module =>
    isModuleEnabled(module, disabledModules)
  )
);

export const getModuleIfEnabled = memoize(
  (moduleName, modules, disabledModules) => {
    const module = modules[moduleName];
    return module && isModuleEnabled(module, disabledModules) ? module : null;
  }
);
