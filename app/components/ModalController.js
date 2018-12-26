// External
import React, { Component } from 'react';

// Internal
import Modal, { ModalContext } from 'components/Modal';

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

  controller = {
    openModal: this.openModal,
    closeModal: this.closeModal,
  };

  render() {
    return (
      <ModalContext.Provider value={this.controller}>
        {this.props.children}
        {this.state.modals.map(({ id, component: Comp, props }) => (
          <Comp key={id} modalID={id} {...props} />
        ))}
      </ModalContext.Provider>
    );
  }
}
