// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Global Dependencies
import Text from 'components/Text';
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import StatusIcon from './StatusIcon';

import checkIcon from 'images/check.sprite.svg';
import syncingIcon from 'images/syncing.sprite.svg';

@connect(({ overview: { blocks }, common: { heighestPeerBlock } }) => ({
  heighestPeerBlock,
  blocks,
}))
export default class SyncStatus extends React.Component {
  statusIcon = () => {
    const { heighestPeerBlock, blocks } = this.props;
    if (heighestPeerBlock > blocks) {
      return (
        <StatusIcon
          icon={syncingIcon}
          style={{ animation: `${animations.spin} 2s linear infinite` }}
        />
      );
    } else {
      return <StatusIcon icon={checkIcon} />;
    }
  };

  statusTooltip = () => {
    const { heighestPeerBlock, blocks, messages } = this.props;

    if (heighestPeerBlock > blocks) {
      return (
        <Text
          id="Header.Syncing"
          data={{ blocks: heighestPeerBlock - blocks }}
        />
      );
    } else {
      return <Text id="Header.Synced" />;
    }
  };

  render() {
    return (
      <Tooltip.Trigger tooltip={this.statusTooltip()}>
        <StatusIcon.Wrapper>{this.statusIcon()}</StatusIcon.Wrapper>
      </Tooltip.Trigger>
    );
  }
}
