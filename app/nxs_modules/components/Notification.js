// External
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import UIContext from 'context/ui';
import { timing } from 'styles';
import { color } from 'utils';

const notifHeight = 40;
const notifMargin = 15;

const intro = keyframes`
  from {
    opacity: 0;
    transform: translateY(-${notifHeight + notifMargin}px)
  }
  to {
    opacity: 1;
    transform: translateY(0)
  }
`;

const outtro = keyframes`
  from { opacity: 1 }
  to { opacity: 0 }
`;

const NotificationComponent = styled.div(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: 15,
    height: notifHeight,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '1.5em',
    paddingRight: '1.5em',
    borderRadius: 2,
    boxShadow: '0 0 8px rgba(0,0,0,.7)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transitionProperty: 'background-color, transform',
    transitionDuration: timing.normal,
    '&::after': {
      content: '"✕"',
      fontSize: 10,
      fontWeight: 'bold',
      position: 'absolute',
      top: 2,
      right: 5,
      opacity: 0,
      transition: `opacity ${timing.normal}`,
    },
    '&:hover': {
      '&::after': {
        opacity: 1,
      },
    },
  },

  ({ index }) => ({
    transform: `translateY(${index * (notifHeight + notifMargin)}px)`,
    animation: `${intro} ${timing.normal} ease-out`,
  }),

  ({ type, theme }) => {
    switch (type) {
      case 'info':
        return {
          background: theme.darkerGray,
          color: theme.light,
          '&:hover': {
            background: color.lighten(theme.darkerGray, 0.2),
          },
        };
      case 'success':
        return {
          background: color.darken(theme.primary, 0.3),
          color: theme.primaryContrast,
          '&:hover': {
            background: color.darken(theme.primary, 0.1),
          },
        };
      case 'error':
        return {
          background: color.darken(theme.error, 0.2),
          color: theme.errorContrast,
          '&:hover': {
            background: theme.error,
          },
        };
    }
  },

  ({ closing }) =>
    closing && {
      animation: `${outtro} ${timing.normal} ease-out`,
    }
);

export default class Notification extends Component {
  static contextType = UIContext;

  static defaultProps = {
    type: 'info',
    autoClose: 3000, // ms
  };

  state = {
    closing: false,
  };

  componentDidMount() {
    if (this.props.autoClose) {
      this.startAutoClose();
    }
  }

  componentWillUnmount() {
    this.stopAutoClose();
  }

  startClosing = () => {
    if (this.props.notifID && this.context.hideNotification) {
      this.stopAutoClose();
      this.setState({ closing: true });
    }
  };

  close = () => {
    this.context.hideNotification(this.props.notifID);
  };

  stopAutoClose = () => {
    clearTimeout(this.autoClose);
  };

  startAutoClose = () => {
    this.stopAutoClose();
    this.autoClose = setTimeout(this.startClosing, this.props.autoClose);
  };

  render() {
    return (
      <NotificationComponent
        closing={this.state.closing}
        {...this.props}
        onClick={this.startClosing}
        onAnimationEnd={this.state.closing ? this.close : undefined}
        onMouseEnter={this.stopAutoClose}
        onMouseLeave={this.startAutoClose}
      />
    );
  }
}
