import { useSelector } from 'react-redux';

import { isCoreConnected } from 'selectors';

export default function CoreStatus() {
  const coreConnected = useSelector(isCoreConnected);
  const manualDaemon = useSelector((state) => state.settings.manualDaemon);
  const autoConnect = useSelector((state) => state.core.autoConnect);
  return coreConnected
    ? ''
    : manualDaemon
    ? __('Remote Core is disconnected')
    : autoConnect
    ? __('Connecting to Nexus Core...')
    : __('Nexus Core is stopped');
}
