import { connect } from 'react-redux';

import { isCoreConnected } from 'selectors';

const mapStateToProps = state => ({
  manualDaemon: state.settings.manualDaemon,
  autoConnect: state.core.autoConnect,
  coreConnected: isCoreConnected(state),
});

const CoreStatus = ({ coreConnected, manualDaemon, autoConnect }) =>
  coreConnected
    ? ''
    : manualDaemon
    ? __('Manual Core is disconnected')
    : autoConnect
    ? __('Connecting to Nexus Core...')
    : __('Nexus Core is stopped');

export default connect(mapStateToProps)(CoreStatus);
