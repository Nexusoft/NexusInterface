import { useAtomValue } from 'jotai';
import {
  useCoreConnected,
  coreInfoPausedAtom,
  coreConnectionErrorAtom,
} from 'lib/coreInfo';
import { settingsAtom } from 'lib/settings';

export default function CoreStatus() {
  const coreConnected = useCoreConnected();
  const { manualDaemon } = useAtomValue(settingsAtom);
  const paused = useAtomValue(coreInfoPausedAtom);
  const connectionError = useAtomValue(coreConnectionErrorAtom);

  if (coreConnected) {
    return '';
  }

  if (manualDaemon) {
    return connectionError
      ? `${__('Remote Core is disconnected')}: ${connectionError}`
      : __('Remote Core is disconnected');
  }

  if (paused) {
    return connectionError
      ? `${__('Nexus Core is stopped')}: ${connectionError}`
      : __('Nexus Core is stopped');
  }

  // Keep the connecting label for transient startup, but always surface the
  // last main-process/RPC failure so the spinner is never silent forever.
  if (connectionError) {
    return `${__('Unable to connect to Nexus Core')}: ${connectionError}`;
  }

  return __('Connecting to Nexus Core...');
}
