import { legacyMode } from 'consts/misc';

export const isCoreConnected = legacyMode
  ? ({ core: { info } }) =>
      !!(info && (info.connections || info.connections === 0))
  : ({ core: { systemInfo } }) =>
      !!(
        systemInfo &&
        (systemInfo.connections || systemInfo.connections === 0)
      );

export const isStaking = legacyMode
  ? ({ core: { info } }) => !!info && info.staking === 'Started'
  : ({ core: { stakeInfo } }) => !!(stakeInfo && stakeInfo.staking);
