// @jsx jsx
// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import { FormattedMessage } from 'react-intl';

// Internal Global Dependencies
import Icon from 'components/common/Icon';
import { animations } from 'styles';
import questionMarkIcon from 'images/question-mark.sprite.svg';
import checkIcon from 'images/check.sprite.svg';
import syncingIcon from 'images/syncing.sprite.svg';

const SpinningIcon = styled(Icon)({
  animation: `${animations.spin} 2s linear infinite`,
});

function statusIcon({
  connections,
  daemonAvailable,
  heighestPeerBlock,
  blocks,
}) {
  if (!connections || !daemonAvailable) {
    return <Icon icon={questionMarkIcon} css={{ opacity: 0.7 }} />;
  } else if (heighestPeerBlock > blocks) {
    return <SpinningIcon icon={syncingIcon} />;
  } else {
    return <Icon icon={checkIcon} />;
  }
}

function syncStatusTooltip({
  connections,
  daemonAvailable,
  heighestPeerBlock,
  blocks,
  messages,
  settings,
}) {
  if (connections === undefined || daemonAvailable === false) {
    return (
      <div>
        <div>Unknown Sync Status</div>
        <div>Waiting for daemon to load...</div>
      </div>
    );
  } else {
    if (heighestPeerBlock > blocks) {
      return (
        messages['Header.Synching'] +
        (heighestPeerBlock - blocks).toString() +
        ' ' +
        messages['Header.Blocks']
      );
    } else {
      return (
        <FormattedMessage id="Header.Synced" defaultMessage="Synchronized" />
      );
    }
  }
}

const SyncStatus = props => (
  <div className="icon">
    {statusIcon(props)}
    <div className="tooltip bottom">
      <div>{syncStatusTooltip(props)}</div>
    </div>
  </div>
);

export default SyncStatus;
