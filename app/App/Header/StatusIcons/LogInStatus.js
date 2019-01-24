// @jsx jsx
// External Dependencies
import React, { Component } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

// Internal Dependencies
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import StatusIcon from 'components/StatusIcon';
import { timing } from 'styles';
import { color } from 'utils';

// Images
import questionMarkIcon from 'images/question-mark.sprite.svg';
import lockedIcon from 'images/padlock.sprite.svg';
import unlockedIcon from 'images/padlock-open.sprite.svg';

const LoginStatusIcon = styled(StatusIcon)(
  ({ theme }) => ({
    cursor: 'pointer',
    color: theme.primary,
    transitionProperty: 'color, filter',
    transitionDuration: timing.normal,
    '&:hover': {
      color: color.lighten(theme.primary, 0.2),
      filter: `drop-shadow(0 0 3px ${color.fade(theme.primary, 0.5)})`,
    },
  }),
  ({ danger, theme }) =>
    danger && {
      color: theme.danger,
      '&:hover': {
        color: color.lighten(theme.danger, 0.2),
        filter: `drop-shadow(0 0 3px ${color.fade(theme.danger, 0.5)})`,
      },
    },
  ({ dimmed }) =>
    dimmed && {
      opacity: 0.7,
    }
);

const mapStateToProps = ({
  overview: { connections, unlocked_until, staking_only },
}) => ({
  connections,
  unlocked_until,
  staking_only,
});

const actionCreators = { push };

@connect(
  mapStateToProps,
  actionCreators
)
export default class LogInStatus extends Component {
  signInStatusMessage = () => {
    const { connections, unlocked_until, staking_only } = this.props;
    let unlockDate = new Date(unlocked_until * 1000).toLocaleString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (connections === undefined) {
      return (
        <div>
          <div>Unknown Lock Status</div>
          <div>Waiting for daemon to load...</div>
        </div>
      );
    }

    if (unlocked_until === undefined) {
      return <Text id="Header.WalletUnencrypted" />;
    } else if (unlocked_until === 0) {
      return <Text id="Header.WalletLocked" />;
    } else if (unlocked_until >= 0) {
      return (
        <>
          <Text id="Header.UnlockedUntil" data={{ unlockDate }} />{' '}
          {!!staking_only && <Text id="Header.StakingOnly" />}
        </>
      );
    }
  };

  statusIcon = () => {
    const { connections, unlocked_until } = this.props;
    if (connections === undefined) {
      return <StatusIcon icon={questionMarkIcon} css={{ opacity: 0.7 }} />;
    } else {
      if (unlocked_until === undefined) {
        return (
          <LoginStatusIcon
            icon={unlockedIcon}
            onClick={this.goToSecurity}
            danger
          />
        );
      } else if (unlocked_until === 0) {
        return (
          <LoginStatusIcon icon={lockedIcon} onClick={this.goToSecurity} />
        );
      } else if (unlocked_until >= 0) {
        return (
          <LoginStatusIcon
            icon={unlockedIcon}
            onClick={this.goToSecurity}
            dimmed
          />
        );
      }
    }
  };

  goToSecurity = () => {
    this.props.push('/Settings/Security');
  };

  render() {
    return (
      <Tooltip.Trigger
        tooltip={this.signInStatusMessage()}
        css={{ maxWidth: 200 }}
      >
        {this.statusIcon()}
      </Tooltip.Trigger>
    );
  }
}
