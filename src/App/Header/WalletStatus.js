// External
import React from 'react';
import { connect } from 'react-redux';

// Internal
import CoreStatus from 'components/CoreStatus';
import { legacyMode } from 'consts/misc';
import { isCoreConnected, isLoggedIn } from 'selectors';
import styled from '@emotion/styled';

__ = __context('Header');

const StakingDanger = styled.div({
  backgroundImage: `linear-gradient(to right, transparent 0%, transparent 20%, ${'#ff0000'} 50%, transparent 80%, transparent 100%)`,
});

/**
 * Handles the Core Status
 *
 * @class WalletStatus
 * @extends {React.Component}
 */
@connect(state => ({
  manualDaemon: state.settings.manualDaemon,
  autoConnect: state.core.autoConnect,
  staking: state.core.stakeInfo.staking,
  blockDate: state.common.blockDate,
  blockCount: state.core.systemInfo.timestamp,
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
    const { coreConnected, loggedIn, staking } = this.props;

    let nowTime = new Date();
    nowTime.setMinutes(nowTime.getMinutes() - 30);
    const isInDanger = nowTime >= this.props.blockDate;
    return !coreConnected ? (
      <span className="dim">
        <CoreStatus />
      </span>
    ) : (
      (!legacyMode && !loggedIn && (
        <span className="dim">{__("You're not logged in")}. </span>
      )) ||
        (!!(isInDanger && staking) && (
          <StakingDanger>
            {__('You are staking but have not received a block in 30 minutes!')}
          </StakingDanger>
        ))
    );
  }
}

export default WalletStatus;
