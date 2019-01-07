// External
import React, { Component } from 'react';

// Internal
import UIController from 'components/UIController';
import SnackBar from 'components/SnackBar';
import Icon from 'components/Icon';
import TaskContext from 'context/task';
import { timing } from 'styles';
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
      this.setState({ closing: true });
      setTimeout(this.close, parseInt(timing.normal));
    }
  };

  close = () => {
    const taskID = this.context;
    UIController.hideBackgroundTask(taskID);
  };

  render() {
    const { children, assignClose, ...rest } = this.props;
    return (
      <SnackBar
        ref={el => {
          this.element = el;
        }}
        closing={this.state.closing}
        onClick={this.animatedClose}
        {...rest}
      >
        <Icon icon={workIcon} spaceRight />
        {children}
      </SnackBar>
    );
  }
}
