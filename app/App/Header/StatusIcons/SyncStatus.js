// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import Text from 'components/Text';
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import StatusIcon from 'components/StatusIcon';

import checkIcon from 'images/check.sprite.svg';
import syncingIcon from 'images/syncing.sprite.svg';

const SpinningIcon = styled(StatusIcon)({
  animation: `${animations.spin} 2s linear infinite`,
});

/**
 * Handles the Sync Status
 *
 * @class SyncStatus
 * @extends {React.Component}
 */
@connect(
  ({
    core: {
      info: { synchronizing, blocks, synccomplete },
    },
    common: { heighestPeerBlock },
  }) => ({
    synchronizing,
    heighestPeerBlock,
    blocks,
    synccomplete,
  })
)
class SyncStatus extends React.Component {
  /**
   * Returns JSX of either Spinning Icon or Status Icon depending on if wallet is in sync
   *
   * @memberof SyncStatus
   * @returns {JSX} JSX
   */
  statusIcon = () => {
    const { synchronizing, heighestPeerBlock, blocks } = this.props;
    const outOfSyncLegacy = heighestPeerBlock > blocks;

    if (synchronizing || outOfSyncLegacy) {
      return <SpinningIcon icon={syncingIcon} />;
    } else {
      return <StatusIcon icon={checkIcon} />;
    }
  };

  /**
   * Returns JSX of tooltip depending on if wallet is in sync or not
   *
   * @memberof SyncStatus
   * @returns {JSX} JSX
   */
  statusTooltip = () => {
    const {
      synchronizing,
      heighestPeerBlock,
      blocks,
      synccomplete,
    } = this.props;
    const outOfSyncLegacy = heighestPeerBlock > blocks;
    let percentSynced = parseInt((blocks / heighestPeerBlock) * 100);
    if (synchronizing) percentSynced = synccomplete;
    if (percentSynced > 100) percentSynced = 0;
    if (synchronizing || outOfSyncLegacy) {
      return <Text id="Header.Syncing" data={{ percent: percentSynced }} />;
    } else {
      return <Text id="Header.Synced" />;
    }
  };

  /**
   * React Render Method
   *
   * @returns {JSX} JSX
   * @memberof SyncStatus
   */
  render() {
    return (
      <Tooltip.Trigger tooltip={this.statusTooltip()}>
        {this.statusIcon()}
      </Tooltip.Trigger>
    );
  }
}
export default SyncStatus;
