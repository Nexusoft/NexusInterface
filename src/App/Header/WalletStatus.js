// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import CoreStatus from 'components/CoreStatus';
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
    const { coreConnected, loggedIn } = this.props;
    return !coreConnected ? (
      <span className="dim">
        <CoreStatus />
      </span>
    ) : (
      !legacyMode && !loggedIn && (
        <span className="dim">{__("You're not logged in")}. </span>
      )
    );
  }
}

export default WalletStatus;
