// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import UIController from 'components/UIController';
import SnackBar from 'components/SnackBar';
import { timing } from 'styles';

const NotificationComponent = styled(SnackBar)({
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
});

export default class Notification extends Component {
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
    if (this.props.notifID) {
      this.stopAutoClose();
      this.setState({ closing: true });
    }
  };

  close = () => {
    UIController.hideNotification(this.props.notifID);
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
        onClick={this.startClosing}
        onAnimationEnd={this.state.closing ? this.close : undefined}
        onMouseEnter={this.stopAutoClose}
        onMouseLeave={this.startAutoClose}
        {...this.props}
      />
    );
  }
}
