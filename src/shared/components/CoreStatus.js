import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';
import { useCoreConnected, coreInfoPausedAtom } from 'lib/coreInfo';

export default function CoreStatus() {
  const coreConnected = useCoreConnected();
  const manualDaemon = useSelector((state) => state.settings.manualDaemon);
  const paused = useAtomValue(coreInfoPausedAtom);
  return coreConnected
    ? ''
    : manualDaemon
    ? __('Remote Core is disconnected')
    : paused
    ? __('Nexus Core is stopped')
    : __('Connecting to Nexus Core...');
}
