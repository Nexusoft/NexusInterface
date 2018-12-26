// External
import React, { Component } from 'react';

// Internal
import Modal from 'components/Modal';
import ConfirmModal from 'components/Modals/ConfirmModal';
import ErrorModal from 'components/Modals/ErrorModal';

const newModalID = (function() {
  let counter = 1;
  return () => `modal-${counter++}`;
})();

export default class ModalController extends Component {
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
      <Modal.Context.Provider value={this.controller}>
        {this.props.children}
        {this.state.modals.map(({ id, component: Comp, props, context }) => (
          <Modal.Context.Provider key={id} value={context}>
            <Comp {...props} />
          </Modal.Context.Provider>
        ))}
      </Modal.Context.Provider>
    );
  }
}
