import semver from 'semver';
import memoize from 'memoize-one';

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
export const isModuleActive = (module, disabledModules) =>
  !module.invalid && !disabledModules.includes(module.name);

/**
 * Memoized getters
 * =============================================================================
 */

export const getAllModules = memoize(modules => Object.values(modules));

export const getActiveModules = memoize((modules, disabledModules) =>
  Object.values(modules).filter(module =>
    isModuleActive(module, disabledModules)
  )
);

export const getModuleIfActive = memoize(
  (moduleName, modules, disabledModules) => {
    const module = modules[moduleName];
    return module && isModuleActive(module, disabledModules) ? module : null;
  }
);
