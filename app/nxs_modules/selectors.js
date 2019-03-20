import memoize from 'memoize-one';

export const selectEnabledModules = memoize(modules =>
  Object.entries(modules)
    .filter(([name, module]) => !module.disabled)
    .reduce((obj, [name, module]) => {
      obj[name] = module;
      return obj;
    }, {})
);
