// External
import React, { Component } from 'react';

// Internal
import { removeBackgroundTask } from 'lib/overlays';
import SnackBar from 'components/SnackBar';
import TaskContext from 'context/task';
import { timing } from 'styles';

const outro = { opacity: [1, 0] };

/**
 * Creates a background task component
 *
 * @export
 * @class BackgroundTask
 * @extends {Component}
 */
export default class BackgroundTask extends Component {
  static contextType = TaskContext;

  static defaultProps = {
    type: 'work',
  };

  snackBarRef = React.createRef();

  /**
   *Creates an instance of BackgroundTask.
   * @param {*} props
   * @memberof BackgroundTask
   */
  constructor(props) {
    super(props);
    props.assignClose && props.assignClose(this.animatedClose);
  }

  /**
   * Animate the closeout
   *
   * @memberof BackgroundTask
   */
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

  /**
   * Remove This task
   *
   * @memberof BackgroundTask
   */
  remove = () => {
    const taskID = this.context;
    removeBackgroundTask(taskID);
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof BackgroundTask
   */
  render() {
    const { children, assignClose, ...rest } = this.props;
    return (
      <SnackBar ref={this.snackBarRef} onClick={this.animatedClose} {...rest}>
        {children}
      </SnackBar>
    );
  }
}
