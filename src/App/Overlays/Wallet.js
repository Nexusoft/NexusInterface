// External
import { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Notification from 'components/Notification';
import ModalContext from 'context/modal';
import TaskContext from 'context/task';
import { zIndex } from 'styles';

import Onboarding from './Onboarding';

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
        <Comp {...props} modalId={id} />
      </ModalContext.Provider>
    ))}
  </>
);

const BackgroundTasks = ({ tasks }) => (
  <SnackBars>
    {tasks.map(({ id, component: Comp, props }, i) => (
      <TaskContext.Provider key={id} value={id}>
        <Comp index={i} {...props} taskId={id} />
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
 * @class Wallet
 * @extends {Component}
 */
@connect(({ ui: { modals, notifications, backgroundTasks, onboarding } }) => ({
  modals,
  notifications,
  backgroundTasks,
  onboarding,
}))
class Wallet extends Component {
  state = {
    show: true,
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Wallet
   */
  render() {
    const { children, modals, notifications, backgroundTasks } = this.props;
    console.log(this.state);
    return (
      <>
        <div>{children}</div>
        <Modals modals={modals} />
        <BackgroundTasks tasks={backgroundTasks} />
        <Notifications
          notifications={notifications}
          taskCount={backgroundTasks.length}
        />

        {this.state.show && (
          <Onboarding CloseOnboarding={() => this.setState({ show: false })} />
        )}
      </>
    );
  }
}

export default Wallet;
