export const finite = (value) => typeof value === 'number' && Number.isFinite(value);

export function stakingStatus(info, system, settings, status) {
  if (!system) return 'offline';
  if (typeof info?.staking !== 'boolean') return 'unavailable';
  if (settings.liteMode || settings.multiUser || !settings.enableStaking) return 'off';
  if (system.syncing) return 'syncing';
  if (status?.unlocked?.staking === false) return 'locked';
  if (info.onhold) return 'hold';
  return info.staking ? 'on' : 'off';
}

// Positions are explorer row positions, not a sum of all accounts owned by a user.
export function rankingPosition(rows, address) {
  if (!Array.isArray(rows) || rows.some((row) => typeof row?.address !== 'string')) {
    throw new Error('Invalid explorer response');
  }
  const index = rows.findIndex((row) => row.address === address);
  return index < 0 ? null : index + 1;
}
