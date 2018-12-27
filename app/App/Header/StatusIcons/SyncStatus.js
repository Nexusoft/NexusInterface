// @jsx jsx
// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import { FormattedMessage } from 'react-intl';

// Internal Global Dependencies
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import StatusIcon from './StatusIcon';

import questionMarkIcon from 'images/question-mark.sprite.svg';
import checkIcon from 'images/check.sprite.svg';
import syncingIcon from 'images/syncing.sprite.svg';

function statusIcon({
  connections,
  daemonAvailable,
  heighestPeerBlock,
  blocks,
}) {
  if (!connections || !daemonAvailable) {
    return <StatusIcon icon={questionMarkIcon} css={{ opacity: 0.7 }} />;
  } else if (heighestPeerBlock > blocks) {
    return (
      <StatusIcon
        icon={syncingIcon}
        style={{ animation: `${animations.spin} 2s linear infinite` }}
      />
    );
  } else {
    return <StatusIcon icon={checkIcon} />;
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
  <Tooltip.Trigger tooltip={syncStatusTooltip(props)}>
    <StatusIcon.Wrapper>{statusIcon(props)}</StatusIcon.Wrapper>
  </Tooltip.Trigger>
);

export default SyncStatus;
