import { legacyMode } from 'consts/misc';

export const isCoreConnected = legacyMode
  ? ({ core: { systemInfo } }) =>
      !!(systemInfo && (systemInfo.connections || systemInfo.connections === 0))
  : ({ core: { info } }) =>
      !!(info && (info.connections || info.connections === 0));

export const isStaking = ({ core: { info } }) =>
  !!info && info.staking === 'Started';
