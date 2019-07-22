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
  timeZone: null,
  notes: '',
};

function getInitialValues(contact) {
  const mine = contact.addresses.filter(c => c.isMine);
  const notMine = contact.addresses.filter(c => !c.isMine);
  return { ...contact, mine, notMine };
}

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
                _`Edit contact`
              ) : (
                _`Create new contact`
              )}
            </Modal.Header>
            <Modal.Body>
              <AddEditContactForm
                form={edit ? `editContact:${contact.name}` : 'createContact'}
                edit={edit}
                oldName={contact && contact.name}
                initialValues={
                  edit ? getInitialValues(contact) : initialContact
                }
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
