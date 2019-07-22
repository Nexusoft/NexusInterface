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
      info: { blocks, synccomplete },
    },
    common: { highestPeerBlock },
  }) => {
    const synccompleteUnknown =
      (!synccomplete && synccomplete !== 0) ||
      synccomplete < 0 ||
      synccomplete > 100;
    return {
      syncUnknown: synccompleteUnknown && !highestPeerBlock,
      synchronizing: synccomplete !== 100 || highestPeerBlock > blocks,
      percentSynced: !synccompleteUnknown
        ? synccomplete
        : highestPeerBlock
        ? Math.floor((100 * blocks) / highestPeerBlock)
        : 0,
    };
  }
)
class SyncStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof SyncStatus
   */
  render() {
    const { syncUnknown, synchronizing, percentSynced } = this.props;
    return syncUnknown ? (
      <Tooltip.Trigger tooltip="Checking sync status">
        <SpinningIcon className="dim" icon={syncingIcon} />
      </Tooltip.Trigger>
    ) : synchronizing ? (
      <Tooltip.Trigger
        tooltip={<Text id="Header.Syncing" data={{ percent: percentSynced }} />}
      >
        <SpinningIcon icon={syncingIcon} />
      </Tooltip.Trigger>
    ) : (
      <Tooltip.Trigger tooltip={_`Synchronized`}>
        <StatusIcon icon={checkIcon} />
      </Tooltip.Trigger>
    );
  }
}
export default SyncStatus;
