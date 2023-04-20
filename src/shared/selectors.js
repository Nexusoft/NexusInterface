import { legacyMode } from 'consts/misc';
import memoize from 'utils/memoize';

export const isCoreConnected = legacyMode
  ? ({ core: { info } }) =>
      !!(info && (info.connections || info.connections === 0))
  : ({ core: { systemInfo } }) => !!systemInfo;

export const isStaking = legacyMode
  ? ({ core: { info } }) => !!info && info.staking === 'Started'
  : ({ user: { stakeInfo } }) => !!(stakeInfo && stakeInfo.staking);

export const isSynchronized = legacyMode
  ? ({ core: { info } }) => !!info && info.synccomplete === 100
  : ({ core: { systemInfo } }) => !systemInfo?.synchronizing; // TODO: update to !systemInfo?.sync when `synchronizing` is removed

export const isLoggedIn = legacyMode
  ? () => false
  : ({ user }) => !!(user && user.status);

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
