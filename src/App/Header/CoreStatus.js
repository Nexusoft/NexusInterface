// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';
import { isCoreConnected } from 'selectors';

/**
 * Handles the Core Status
 *
 * @class CoreStatus
 * @extends {React.Component}
 */
@connect(state => ({
  manualDaemon: state.settings.manualDaemon,
  autoConnect: state.core.autoConnect,
  coreConnected: isCoreConnected(state),
}))
class CoreStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof CoreStatus
   */
  render() {
    const { manualDaemon, coreConnected, autoConnect } = this.props;
    return (
      !coreConnected && (
        <span className="dim">
          {manualDaemon ? (
            <Text id="Alert.ManualDaemonDown" />
          ) : autoConnect ? (
            <>
              <Text id="Alert.DaemonLoadingWait" />
              ...
            </>
          ) : (
            'Nexus Core is stopped'
          )}
        </span>
      )
    );
  }
}

export default CoreStatus;
