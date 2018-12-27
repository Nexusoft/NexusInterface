// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import ConfirmModal from 'components/Modals/ConfirmModal';
import ErrorModal from 'components/Modals/ErrorModal';
import Notification from 'components/Notification';
import UIContext from 'context/ui';

const newModalID = (function() {
  let counter = 1;
  return () => `modal-${counter++}`;
})();

const newNotifID = (function() {
  let counter = 1;
  return () => `notif-${counter++}`;
})();

const NotificationsComponent = styled.div({
  position: 'fixed',
  top: 20,
  left: 20,
});

const Modals = ({ modals }) => (
  <>
    {modals.map(({ id, component: Comp, props, context }) => (
      <UIContext.Provider key={id} value={context}>
        <Comp {...props} />
      </UIContext.Provider>
    ))}
  </>
);

const Notifications = ({ notifications }) => (
  <NotificationsComponent>
    {notifications.map(({ id, type, content }, i) => (
      <Notification key={id} notifID={id} type={type} index={i}>
        {content}
      </Notification>
    ))}
  </NotificationsComponent>
);

export default class UIController extends Component {
  state = {
    modals: [],
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
          context: {
            modalID,
            ...this.controller,
          },
        },
      ],
    });
    return modalID;
  };

  closeModal = modalID => {
    const modals = [...this.state.modals];
    const index = modals.findIndex(m => m.id === modalID);
    if (index >= 0) {
      modals.splice(index, 1);
      this.setState({ modals });
      return true;
    }
    return false;
  };

  openConfirmModal = props => this.openModal(ConfirmModal, props);

  openErrorModal = props => this.openModal(ErrorModal, props);

  showNotification = (content, type) => {
    const notifID = newNotifID();
    this.setState({
      notifications: [
        {
          id: notifID,
          type,
          content,
        },
        ...this.state.notifications,
      ],
    });
    return notifID;
  };

  hideNotification = notifID => {
    const notifications = [...this.state.notifications];
    const index = notifications.findIndex(n => n.id === notifID);
    if (index >= 0) {
      notifications.splice(index, 1);
      this.setState({ notifications });
      return true;
    }
    return false;
  };

  controller = {
    openModal: this.openModal,
    closeModal: this.closeModal,
    openConfirmModal: this.openConfirmModal,
    openErrorModal: this.openErrorModal,

    showNotification: this.showNotification,
    hideNotification: this.hideNotification,
  };

  render() {
    return (
      <UIContext.Provider value={this.controller}>
        {this.props.children}
        <Modals modals={this.state.modals} />
        <Notifications notifications={this.state.notifications} />
      </UIContext.Provider>
    );
  }
}
