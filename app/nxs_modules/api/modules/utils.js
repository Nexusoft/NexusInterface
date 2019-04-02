import semver from 'semver';
import memoize from 'memoize-one';

/**
 * Checkers
 * =============================================================================
 */

// Page modules are module types that will be rendered into a page, and has
// an icon of their own in the navigation bar similarly to the wallet's native pages
export const isPageModule = module =>
  module.type === 'page' || module.type === 'page-panel';

// Check if the Module API this module was built on is still supported
export const isModuleDeprecated = module =>
  semver.lt(module.apiVersion, SUPPORTED_MODULE_API_VERSION);

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
