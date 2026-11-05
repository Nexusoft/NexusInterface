import type { CoreInfo } from './api';

export const CORE_INFO_MAX_AGE_MS = 30_000;

export type SyncState = 'unknown' | 'synchronizing' | 'synchronized';

export function isFreshCoreInfo(
  updatedAt: number,
  now: number,
  unavailable: boolean,
  invalidatedAt = 0
): boolean {
  return (
    !unavailable &&
    updatedAt > 0 &&
    updatedAt > invalidatedAt &&
    now >= updatedAt &&
    now - updatedAt < CORE_INFO_MAX_AGE_MS
  );
}

export function getSyncState(info: CoreInfo | undefined): SyncState {
  if (!info) return 'unknown';
  if (
    info.syncing === true ||
    (info.syncing && typeof info.syncing === 'object') ||
    info.synchronizing === true
  ) {
    return 'synchronizing';
  }
  if (info.synchronized === false) return 'synchronizing';
  if (
    info.synchronized === true ||
    info.syncing === false ||
    info.synchronizing === false
  ) {
    return 'synchronized';
  }
  return 'unknown';
}
