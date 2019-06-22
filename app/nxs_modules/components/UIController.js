// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import ConfirmDialog from 'components/Dialogs/ConfirmDialog';
import ErrorDialog from 'components/Dialogs/ErrorDialog';
import SuccessDialog from 'components/Dialogs/SuccessDialog';
import Notification from 'components/Notification';
import ModalContext from 'context/modal';
import TaskContext from 'context/task';
import { zIndex } from 'styles';

const newModalID = (function() {
  let counter = 1;
  return () => `modal-${counter++}`;
})();

const newNotifID = (function() {
  let counter = 1;
  return () => `notif-${counter++}`;
})();

const newTaskID = (function() {
  let counter = 1;
  return () => `task-${counter++}`;
})();

const SnackBars = styled.div({
  position: 'fixed',
  top: 20,
  left: 20,
  zIndex: zIndex.snackBars,
});

const Modals = ({ modals }) => (
  <>
    {modals.map(({ id, component: Comp, props }) => (
      <ModalContext.Provider key={id} value={id}>
        <Comp {...props} />
      </ModalContext.Provider>
    ))}
  </>
);

const BackgroundTasks = ({ tasks }) => (
  <SnackBars>
    {tasks.map(({ id, component: Comp, props }, i) => (
      <TaskContext.Provider key={id} value={id}>
        <Comp index={i} {...props} />
      </TaskContext.Provider>
    ))}
  </SnackBars>
);

const Notifications = ({ notifications, taskCount }) => (
  <SnackBars>
    {notifications.map(({ id, type, children, content, ...props }, i) => (
      <Notification
        key={id}
        notifID={id}
        type={type}
        index={taskCount + i}
        {...props}
      >
        {children || content}
      </Notification>
    ))}
  </SnackBars>
);

// Store the only instance of UIController class
let singleton = null;
// Default state for modals, can be updated even before
// the UIController instance is created
const defaultModals = [];

// UIController is a SINGLETON class
/**
 * Controlles the elements that get rendered over the main app, so dialogs/modals etc
 *
 * @export
 * @class UIController
 * @extends {Component}
 */
export default class UIController extends Component {
  // For opening modals before the UIController instance is even created
  static openModal = (component, props) => {
    const modalID = newModalID();
    defaultModals.push({
      id: modalID,
      component,
      props,
    });
  };

  /**
   *Creates an instance of UIController.
   * @param {*} props
   * @memberof UIController
   */
  constructor(props) {
    super(props);

    // Ensure there are no other instances
    if (singleton) {
      throw new Error('Cannot have more than one instance of UIController!');
    }
    singleton = this;

    // Expose the public UI APIs
    UIController.openModal = this.openModal;
    UIController.removeModal = this.removeModal;
    UIController.openConfirmDialog = this.openConfirmDialog;
    UIController.openErrorDialog = this.openErrorDialog;
    UIController.openSuccessDialog = this.openSuccessDialog;

    UIController.showNotification = this.showNotification;
    UIController.removeNotification = this.removeNotification;

    UIController.showBackgroundTask = this.showBackgroundTask;
    UIController.removeBackgroundTask = this.removeBackgroundTask;
  }

  state = {
    modals: defaultModals,
    tasks: [],
    notifications: [],
  };

  /**
   * Open a Modal
   *
   * @memberof UIController
   */
  openModal = (component, props) => {
    const modalID = newModalID();
    this.setState({
      modals: [
        ...this.state.modals,
        {
          id: modalID,
          component,
          props,
        },
      ],
    });
    return modalID;
  };

  /**
   * Remove this Modal
   *
   * @memberof UIController
   */
  removeModal = modalID => {
    const modals = this.state.modals.filter(m => m.id !== modalID);
    this.setState({ modals });
  };

  /**
   * Open a Confirm Dialog
   *
   * @memberof UIController
   */
  openConfirmDialog = props => this.openModal(ConfirmDialog, props);

  /**
   * Open a Error Dialog
   *
   * @memberof UIController
   */
  openErrorDialog = props => this.openModal(ErrorDialog, props);

  /**
   * Open a Success Dialog
   *
   * @memberof UIController
   */
  openSuccessDialog = props => this.openModal(SuccessDialog, props);

  // showNotification(content: any, type: String), or
  // showNotification(content: any, options: object)
  /**
   * Show A Notification
   *
   * @memberof UIController
   */
  showNotification = (content, param) => {
    const notifID = newNotifID();
    const options = typeof param === 'string' ? { type: param } : param;
    const notif = {
      id: notifID,
      content,
      ...options,
    };

    this.setState({
      notifications: [notif, ...this.state.notifications],
    });
    return notifID;
  };

  /**
   * Remove A Notification
   *
   * @memberof UIController
   */
  removeNotification = notifID => {
    const notifications = this.state.notifications.filter(
      n => n.id !== notifID
    );
    this.setState({ notifications });
  };

  /**
   * Shows a Background Task
   *
   * @memberof UIController
   */
  showBackgroundTask = (component, props) => {
    const taskID = newTaskID();
    this.setState({
      tasks: [
        ...this.state.tasks,
        {
          id: taskID,
          component,
          props,
        },
      ],
    });
    return taskID;
  };

  /**
   * Removes a Background Task
   *
   * @memberof UIController
   */
  removeBackgroundTask = taskID => {
    const tasks = this.state.tasks.filter(t => t.id !== taskID);
    this.setState({ tasks });
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof UIController
   */
  render() {
    return (
      <>
        {this.props.children}
        <Modals modals={this.state.modals} />
        <BackgroundTasks tasks={this.state.tasks} />
        <Notifications
          notifications={this.state.notifications}
          taskCount={this.state.tasks.length}
        />
      </>
    );
  }
}
