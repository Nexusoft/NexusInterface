import memoize from 'utils/memoize';

export const isCoreConnected = ({ core: { systemInfo } }) => !!systemInfo;

export const isStaking = ({ user: { stakeInfo } }) =>
  !!(stakeInfo && stakeInfo.staking);

export const isSynchronized = ({ core: { systemInfo } }) =>
  !systemInfo?.syncing;

export const isLoggedIn = ({ user }) => !!(user && user.status);

export const selectBalances = memoize(
  (balances) => {
    if (!balances) return [undefined, undefined];
    const nxsIndex = balances.findIndex(({ token }) => token === '0');
    const tokenBalances = [...balances];
    const [nxsBalances] =
      nxsIndex >= 0 ? tokenBalances.splice(nxsIndex, 1) : [undefined];
    return [nxsBalances, tokenBalances];
  },
  ({ user: { balances } }) => [balances]
);

export const selectModuleUpdateCount = memoize(
  (modules) =>
    modules
      ? Object.values(modules).filter((module) => module.hasNewVersion).length
      : 0,
  (state) => [state.modules]
);
