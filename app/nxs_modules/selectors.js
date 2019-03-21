import memoize from 'memoize-one';

export const selectAllModules = memoize(modules => Object.values(modules));

export const selectEnabledModules = memoize(modules =>
  Object.values(modules).filter(module => !module.invalid)
);
