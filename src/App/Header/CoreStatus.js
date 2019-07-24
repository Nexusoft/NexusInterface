// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
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
            __('Manual Core is disconnected')
          ) : autoConnect ? (
            <>
              {__('Connecting to Nexus Core')}
              ...
            </>
          ) : (
            __('Nexus Core is stopped')
          )}
        </span>
      )
    );
  }
}

export default CoreStatus;
