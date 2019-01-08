// External
import React, { Component } from 'react';

// Internal
import UIController from 'components/UIController';
import SnackBar from 'components/SnackBar';
import Icon from 'components/Icon';
import TaskContext from 'context/task';
import { timing } from 'styles';
import workIcon from 'images/work.sprite.svg';

const outro = { opacity: [1, 0] };

export default class BackgroundTask extends Component {
  static contextType = TaskContext;

  static defaultProps = {
    type: 'work',
  };

  constructor(props) {
    super(props);
    props.assignClose && props.assignClose(this.animatedClose);
  }

  animatedClose = () => {
    const taskID = this.context;
    if (taskID) {
      const duration = parseInt(timing.quick);
      this.element.animate(outro, {
        duration,
        fill: 'both',
      });
      setTimeout(this.close, duration);
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
        onClick={this.animatedClose}
        {...rest}
      >
        <Icon icon={workIcon} spaceRight />
        {children}
      </SnackBar>
    );
  }
}
