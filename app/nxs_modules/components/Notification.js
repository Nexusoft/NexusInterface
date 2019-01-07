// External
import React, { Component } from 'react';

// Internal
import UIController from 'components/UIController';
import SnackBar from 'components/SnackBar';

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
      <SnackBar
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
