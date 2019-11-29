// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import { legacyMode } from 'consts/misc';
import { isCoreConnected, isLoggedIn } from 'selectors';

__ = __context('Header');

/**
 * Handles the Core Status
 *
 * @class WalletStatus
 * @extends {React.Component}
 */
@connect(state => ({
  manualDaemon: state.settings.manualDaemon,
  autoConnect: state.core.autoConnect,
  coreConnected: isCoreConnected(state),
  loggedIn: isLoggedIn(state),
}))
class WalletStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof WalletStatus
   */
  render() {
    const { manualDaemon, coreConnected, autoConnect, loggedIn } = this.props;
    return !coreConnected ? (
      <span className="dim">
        {manualDaemon
          ? __('Manual Core is disconnected')
          : autoConnect
          ? __('Connecting to Nexus Core...')
          : __('Nexus Core is stopped')}
      </span>
    ) : (
      !legacyMode && !loggedIn && (
        <span className="dim">{__("You're not logged in")}. </span>
      )
    );
  }
}

export default WalletStatus;
