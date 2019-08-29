import { legacyMode } from 'consts/misc';

export const isCoreConnected = legacyMode
  ? ({ core: { info } }) =>
      !!(info && (info.connections || info.connections === 0))
  : ({ core }) =>
      !!(
        core &&
        core.systemInfo &&
        (core.systemInfo.connections || core.systemInfo.connections === 0)
      );

export const isStaking = legacyMode
  ? ({ core: { info } }) => !!info && info.staking === 'Started'
  : ({ core: { stakeInfo } }) => !!(stakeInfo && stakeInfo.staking);

export const isSynchronized = legacyMode
  ? ({ core: { info } }) => !!info && info.synccomplete === 100
  : ({ core: { systemInfo } }) => !!systemInfo && !systemInfo.synchronizing;

export const isLoggedIn = legacyMode
  ? () => false
  : ({ core }) => !!(core && core.userStatus);
