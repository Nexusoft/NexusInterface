import semver from 'semver';
import memoize from 'utils/memoize';

/**
 * Checkers
 * =============================================================================
 */

// Check if the Module API this module was built on is still supported
export const isModuleDeprecated = module =>
  semver.lt(module.specVersion, SUPPORTED_MODULE_SPEC_VERSION);

// Check if a module is valid
export const isModuleValid = (module, { devMode, verifyModuleSource }) =>
  !isModuleDeprecated(module) &&
  ((devMode && !verifyModuleSource) ||
    (module.repository && module.repoOnline && module.repoVerified));

// Check if a module is active, which means it's valid and not disabled by user
export const isModuleEnabled = (module, disabledModules) =>
  !module.invalid && !disabledModules.includes(module.name);

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
