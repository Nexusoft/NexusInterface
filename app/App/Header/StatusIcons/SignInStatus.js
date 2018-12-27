// @jsx jsx
// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import { FormattedMessage } from 'react-intl';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import StatusIcon from './StatusIcon';
import { colors } from 'styles';

// Images
import questionMarkIcon from 'images/question-mark.sprite.svg';
import lockedIcon from 'images/padlock.sprite.svg';
import unlockedIcon from 'images/padlock-open.sprite.svg';

function statusIcon({ connections, daemonAvailable, unlocked_until }) {
  if (!connections || !daemonAvailable) {
    return <StatusIcon icon={questionMarkIcon} css={{ opacity: 0.7 }} />;
  } else {
    if (unlocked_until === undefined) {
      return <StatusIcon icon={unlockedIcon} css={{ color: colors.error }} />;
    } else if (unlocked_until === 0) {
      return <StatusIcon icon={lockedIcon} />;
    } else if (unlocked_until >= 0) {
      return <StatusIcon icon={unlockedIcon} />;
    }
  }
}

function signInStatusMessage({
  connections,
  daemonAvailable,
  unlocked_until,
  minting_only,
  staking_only,
}) {
  let unlockDate = new Date(unlocked_until * 1000).toLocaleString('en', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  if (!connections || !daemonAvailable) {
    return (
      <div>
        <div>Unknown Lock Status</div>
        <div>Waiting for daemon to load...</div>
      </div>
    );
  }

  if (unlocked_until === undefined) {
    return (
      <FormattedMessage
        id="Header.WalletUnencrypted"
        defaultMessage="Wallet Unencrypted"
      />
    );
  } else if (unlocked_until === 0) {
    return (
      <FormattedMessage
        id="Header.WalletLocked"
        defaultMessage="Wallet Locked"
      />
    );
  } else if (unlocked_until >= 0) {
    if (staking_only) {
      return (
        <>
          <FormattedMessage
            id="Header.UnlockedUntil"
            defaultMessage="Unlocked Until"
          />{' '}
          {unlockDate}{' '}
          <FormattedMessage
            id="Header.StakingOnly"
            defaultMessage="Staking Only"
          />
        </>
      );
    } else {
      return (
        <>
          <FormattedMessage
            id="Header.UnlockedUntil"
            defaultMessage="Unlocked Until"
          />{' '}
          {unlockDate}
        </>
      );
    }
  }
}

const SignInStatus = props => (
  <Tooltip.Trigger tooltip={signInStatusMessage(props)}>
    <StatusIcon.Wrapper>{statusIcon(props)}</StatusIcon.Wrapper>
  </Tooltip.Trigger>
);

export default SignInStatus;
