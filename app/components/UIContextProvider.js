// External
import React, { Component } from 'react';

// Internal
import Modal from 'components/Modal';
import ConfirmModal from 'components/Modals/ConfirmModal';
import ErrorModal from 'components/Modals/ErrorModal';
import UIContext from 'context/ui';

const newModalID = (function() {
  let counter = 1;
  return () => `modal-${counter++}`;
})();

export default class UIContextProvider extends Component {
  state = {
    modals: [],
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

  controller = {
    openModal: this.openModal,
    closeModal: this.closeModal,
    openConfirmModal: this.openConfirmModal,
    openErrorModal: this.openErrorModal,
  };

  render() {
    return (
      <UIContext.Provider value={this.controller}>
        {this.props.children}
        {this.state.modals.map(({ id, component: Comp, props, context }) => (
          <UIContext.Provider key={id} value={context}>
            <Comp {...props} />
          </UIContext.Provider>
        ))}
      </UIContext.Provider>
    );
  }
}
