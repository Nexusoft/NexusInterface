import { legacyMode } from 'consts/misc';

export const isCoreConnected = legacyMode
  ? ({ core: { info } }) =>
      !!(info && (info.connections || info.connections === 0))
  : ({ core: { systemInfo } }) => !!systemInfo;

export const isStaking = legacyMode
  ? ({ core: { info } }) => !!info && info.staking === 'Started'
  : ({ user: { stakeInfo } }) => !!(stakeInfo && stakeInfo.staking);

export const isSynchronized = legacyMode
  ? ({ core: { info } }) => !!info && info.synccomplete === 100
  : ({ core: { systemInfo } }) => !!systemInfo && !systemInfo.synchronizing;

export const isLoggedIn = legacyMode
  ? () => false
  : ({ user }) => !!(user && user.status);
