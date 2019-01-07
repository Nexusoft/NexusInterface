// External
import React, { Component } from 'react';

// Internal
import UIController from 'components/UIController';
import SnackBar from 'components/SnackBar';
import Icon from 'components/Icon';
import TaskContext from 'context/task';
import workIcon from 'images/work.sprite.svg';

export default class BackgroundTask extends Component {
  static contextType = TaskContext;

  static defaultProps = {
    type: 'work',
  };

  constructor(props) {
    super(props);
    props.assignClose && props.assignClose(this.animatedClose);
  }

  state = {
    closing: false,
  };

  animatedClose = () => {
    const taskID = this.context;
    if (taskID) {
      this.stopAutoClose();
      this.setState({ closing: true });
    }
  };

  close = () => {
    const taskID = this.context;
    UIController.hideNotification(taskID);
  };

  render() {
    const { children, assignClose, ...rest } = this.props;
    return (
      <SnackBar
        closing={this.state.closing}
        onClick={this.animatedClose}
        onAnimationEnd={this.state.closing ? this.close : undefined}
        {...rest}
      >
        <Icon icon={workIcon} spaceRight />
        {children}
      </SnackBar>
    );
  }
}
