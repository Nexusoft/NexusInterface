export const isCoreConnected = ({ core: { info } }) =>
  !!(info && (info.connections || info.connections === 0));

export const isStaking = ({ core: { info } }) =>
  !!info && info.staking === 'Started';
