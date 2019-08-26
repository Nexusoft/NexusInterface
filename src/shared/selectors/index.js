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
