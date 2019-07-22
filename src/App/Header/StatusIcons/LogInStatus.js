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
import * as color from 'utils/color';

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
  core: {
    info: { connections, unlocked_until, minting_only, locked },
  },
}) => ({
  connections,
  unlocked_until,
  minting_only,
  locked,
});

const actionCreators = { push };

/**
 * Handles the Login Status
 *
 * @class LogInStatus
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  actionCreators
)
class LogInStatus extends Component {
  /**
   * Sign in Message
   *
   * @memberof LogInStatus
   */
  signInStatusMessage = () => {
    const { connections, unlocked_until, minting_only, locked } = this.props;
    let unlockDate = new Date(unlocked_until * 1000).toLocaleString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (connections === undefined) {
      return (
        <div>
          <div>Unknown login status</div>
          <div>Waiting for Nexus Core to load...</div>
        </div>
      );
    }

    if (locked === undefined) {
      return _('Wallet Unencrypted');
    } else if (locked) {
      return _('Not logged in');
    } else if (locked === false) {
      if (!unlocked_until) {
        return (
          <>
            {_('Logged in')} {!!minting_only && _('for staking only')}
          </>
        );
      } else {
        return (
          <>
            <Text id="Header.UnlockedUntil" data={{ unlockDate }} />{' '}
            {!!minting_only && _('for staking only')}
          </>
        );
      }
    }
  };

  /**
   * Return the correct status icon
   *
   * @memberof LogInStatus
   */
  statusIcon = () => {
    const { connections, locked } = this.props;
    if (connections === undefined) {
      return <StatusIcon icon={questionMarkIcon} css={{ opacity: 0.7 }} />;
    } else {
      if (locked === undefined) {
        return (
          <LoginStatusIcon
            icon={unlockedIcon}
            onClick={this.goToSecurity}
            danger
          />
        );
      } else if (locked === true) {
        return (
          <LoginStatusIcon icon={lockedIcon} onClick={this.goToSecurity} />
        );
      } else if (locked === false) {
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

  /**
   * Go to the Security Page
   *
   * @memberof LogInStatus
   */
  goToSecurity = () => {
    this.props.push('/Settings/Security');
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof LogInStatus
   */
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
export default LogInStatus;
