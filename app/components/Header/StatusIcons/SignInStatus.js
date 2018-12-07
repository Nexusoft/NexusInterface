// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { FormattedMessage } from 'react-intl';

// Internal Global Dependencies
import Icon from 'components/common/Icon';
import questionMarkIcon from 'images/question-mark.sprite.svg';
import unencryptedIcon from 'images/lock-unencrypted.sprite.svg';
import lockedIcon from 'images/lock-encrypted.sprite.svg';
import unlockedIcon from 'images/lock-minting.sprite.svg';

function statusIcon({ connections, daemonAvailable, unlocked_until }) {
  if (connections === undefined || daemonAvailable === false) {
    return questionMarkIcon;
  } else {
    if (unlocked_until === undefined) {
      return unencryptedIcon;
    } else if (unlocked_until === 0) {
      return lockedIcon;
    } else if (unlocked_until >= 0) {
      return unlockedIcon;
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
    <Icon icon={statusIcon(props)} />
    <div className="tooltip bottom">
      <div>{signInStatusMessage(props)}</div>
    </div>
  </div>
);

export default SignInStatus;
