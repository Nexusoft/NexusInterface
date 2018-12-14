// @jsx jsx
// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import { FormattedMessage } from 'react-intl';

// Internal Global Dependencies
import Icon from 'components/common/Icon';

// Images
import questionMarkIcon from 'images/question-mark.sprite.svg';
import lockedIcon from 'images/padlock.sprite.svg';
import unlockedIcon from 'images/padlock-open.sprite.svg';

function statusIcon({ connections, daemonAvailable, unlocked_until }) {
  if (connections === undefined || daemonAvailable === false) {
    return <Icon icon={questionMarkIcon} css={{ opacity: 0.7 }} />;
  } else {
    if (unlocked_until === undefined) {
      return <Icon icon={unlockedIcon} css={{ color: 'red' }} />;
    } else if (unlocked_until === 0) {
      return <Icon icon={lockedIcon} />;
    } else if (unlocked_until >= 0) {
      return <Icon icon={unlockedIcon} />;
    }
  }
}

function signInStatusMessage({
  connections,
  daemonAvailable,
  unlocked_until,
  minting_only,
}) {
  let unlockDate = new Date(unlocked_until * 1000).toLocaleString('en', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  if (connections === undefined || daemonAvailable === false) {
    return (
      <FormattedMessage
        id="Header.DaemonNotLoaded"
        defaultMessage="Daemon Not Loaded"
      />
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
  <div className="icon">
    {statusIcon(props)}
    <div className="tooltip bottom">
      <div>{signInStatusMessage(props)}</div>
    </div>
  </div>
);

export default SignInStatus;
