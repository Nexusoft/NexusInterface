import { useAtomValue } from 'jotai';
import { useCoreConnected, coreInfoPausedAtom } from 'lib/coreInfo';
import { settingAtoms } from 'lib/settings';

export default function CoreStatus() {
  const coreConnected = useCoreConnected();
  const manualDaemon = useAtomValue(settingAtoms.manualDaemon);
  const paused = useAtomValue(coreInfoPausedAtom);
  return coreConnected
    ? ''
    : manualDaemon
    ? __('Remote Core is disconnected')
    : paused
    ? __('Nexus Core is stopped')
    : __('Connecting to Nexus Core...');
}
