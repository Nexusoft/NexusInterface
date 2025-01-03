import memoize from 'utils/memoize';

export const selectModuleUpdateCount = memoize(
  (modules) =>
    modules
      ? Object.values(modules).filter((module) => module.hasNewVersion).length
      : 0,
  (state) => [state.modules]
);
