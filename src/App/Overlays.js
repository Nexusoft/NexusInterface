// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Notification from 'components/Notification';
import ModalContext from 'context/modal';
import TaskContext from 'context/task';
import { zIndex } from 'styles';

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

/**
 * Controls the elements that get rendered over the main app, so dialogs/modals etc
 *
 * @export
 * @class Overlays
 * @extends {Component}
 */
@connect(({ ui: { modals, notifications, backgroundTasks } }) => ({
  modals,
  notifications,
  backgroundTasks,
}))
export default class Overlays extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Overlays
   */
  render() {
    const { children, modals, notifications, backgroundTasks } = this.props;
    return (
      <>
        <div>{children}</div>
        <Modals modals={modals} />
        <BackgroundTasks tasks={backgroundTasks} />
        <Notifications
          notifications={notifications}
          taskCount={backgroundTasks.length}
        />
      </>
    );
  }
}
