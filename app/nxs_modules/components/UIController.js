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
  zIndex: 9002,
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

  removeModal = modalID => {
    const modals = this.state.modals.filter(m => m.id !== modalID);
    this.setState({ modals });
  };

  openConfirmDialog = props => this.openModal(ConfirmDialog, props);

  openErrorDialog = props => this.openModal(ErrorDialog, props);

  openSuccessDialog = props => this.openModal(SuccessDialog, props);

  // showNotification(options: object), or
  // showNotification(content: any, type: string)
  showNotification = (content, type) => {
    const notifID = newNotifID();
    let notif = {};
    if (typeof content === 'string') {
      notif = {
        id: notifID,
        type,
        content,
      };
    } else {
      const options = content;
      notif = {
        id: notifID,
        ...options,
      };
    }

    this.setState({
      notifications: [notif, ...this.state.notifications],
    });
    return notifID;
  };

  removeNotification = notifID => {
    const notifications = this.state.notifications.filter(
      n => n.id !== notifID
    );
    this.setState({ notifications });
  };

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

  removeBackgroundTask = taskID => {
    const tasks = this.state.tasks.filter(t => t.id !== taskID);
    this.setState({ tasks });
  };

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
