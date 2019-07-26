// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import { isCoreConnected } from 'selectors';
import { timing } from 'styles';
import * as color from 'utils/color';
import StatusIcon from './StatusIcon';

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

const mapStateToProps = state => {
  const {
    core: {
      info: { unlocked_until, minting_only, locked },
    },
    settings: { enableMining, enableStaking },
  } = state;
  return {
    coreConnected: isCoreConnected(state),
    unlocked_until,
    minting_only,
    locked,
    enableMining,
    enableStaking,
  };
};

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
    const { coreConnected, unlocked_until, minting_only, locked } = this.props;

    if (!coreConnected) {
      return __('Unknown login status');
    }

    if (locked === undefined) {
      return __('Wallet is not encrypted');
    } else if (locked) {
      return __('Not logged in');
    } else if (locked === false) {
      const unlockDate =
        unlocked_until &&
        new Date(unlocked_until * 1000).toLocaleString('en', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      return (
        <>
          {__(
            'Logged in<if_timed> until %{unlockDate}</if_timed><if_minting_only> for staking & mining</if_minting_only>',
            {
              unlockDate,
            },
            {
              if_timed: !!unlocked_until,
              if_minting_only: !!minting_only,
            }
          )}
        </>
      );
    }
  };

  /**
   * Return the correct status icon
   *
   * @memberof LogInStatus
   */
  statusIcon = () => {
    const { coreConnected, locked } = this.props;
    if (!coreConnected) {
      return <LoginStatusIcon icon={questionMarkIcon} dimmed />;
    }

    if (locked === undefined) {
      return (
        <LoginStatusIcon
          icon={unlockedIcon}
          onClick={this.goToSecurity}
          danger
        />
      );
    } else if (locked === true) {
      return <LoginStatusIcon icon={lockedIcon} onClick={this.goToSecurity} />;
    } else if (locked === false) {
      return (
        <LoginStatusIcon
          icon={unlockedIcon}
          onClick={this.goToSecurity}
          dimmed
        />
      );
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
        style={{ maxWidth: 200 }}
      >
        {this.statusIcon()}
      </Tooltip.Trigger>
    );
  }
}
export default LogInStatus;
