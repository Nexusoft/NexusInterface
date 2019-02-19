// External
import React, { Component } from 'react';

// Internal
import Text from 'components/Text';
import Modal from 'components/Modal';
import AddEditContactForm from './AddEditContactForm';

const initialContact = {
  name: '',
  notMine: [
    {
      address: '',
      label: '',
    },
  ],
  mine: [],
  email: '',
  phoneNumber: '',
  timezone: null,
  notes: '',
};

/**
 * The Add or Edit Contact Modal
 *
 * @class AddEditContactModal
 * @extends {Component}
 */
class AddEditContactModal extends Component {
  render() {
    const { edit, contact } = this.props;

    return (
      <Modal>
        {closeModal => (
          <>
            <Modal.Header>
              {edit ? (
                <Text id="AddEditContact.EditContact" />
              ) : (
                <Text id="AddEditContact.CreateNewContact" />
              )}
            </Modal.Header>
            <Modal.Body>
              <AddEditContactForm
                edit={edit}
                oldName={contact && contact.name}
                initialValues={edit ? contact : initialContact}
                closeModal={closeModal}
              />
            </Modal.Body>
          </>
        )}
      </Modal>
    );
  }
}

export default AddEditContactModal;
