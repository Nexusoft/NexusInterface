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

  snackBarRef = React.createRef();

  constructor(props) {
    super(props);
    props.assignClose && props.assignClose(this.animatedClose);
  }

  animatedClose = () => {
    const taskID = this.context;
    if (taskID) {
      const duration = parseInt(timing.quick);
      this.snackBarRef.current.animate(outro, {
        duration,
        fill: 'both',
      });
      setTimeout(this.remove, duration);
    }
  };

  remove = () => {
    const taskID = this.context;
    UIController.removeBackgroundTask(taskID);
  };

  render() {
    const { children, assignClose, ...rest } = this.props;
    return (
      <SnackBar ref={this.snackBarRef} onClick={this.animatedClose} {...rest}>
        <Icon icon={workIcon} spaceRight />
        {children}
      </SnackBar>
    );
  }
}
