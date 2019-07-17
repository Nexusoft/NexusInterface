export const isCoreConnected = ({ core: { info } }) =>
  !!(info && (info.connections || info.connections === 0));
