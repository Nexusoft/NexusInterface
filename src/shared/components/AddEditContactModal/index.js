// External
import { Component } from 'react';

// Internal
import ControlledModal from 'components/ControlledModal';
import AddEditContactForm from './AddEditContactForm';

__ = __context('AddEditContact');

const initialContact = {
  name: '',
  notMine: [
    {
      address: '',
      label: '',
    },
  ],
  mine: [],
  genesis: '',
  email: '',
  phoneNumber: '',
  timeZone: null,
  notes: '',
};

function getInitialValues(contact) {
  const mine = contact.addresses.filter((c) => c.isMine);
  const notMine = contact.addresses.filter((c) => !c.isMine);
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
    const { edit, contact, prefill } = this.props;

    return (
      <ControlledModal>
        {(closeModal) => (
          <>
            <ControlledModal.Header>
              {edit ? __('Edit contact') : __('Create new contact')}
            </ControlledModal.Header>
            <ControlledModal.Body>
              <AddEditContactForm
                form={edit ? `editContact:${contact.name}` : 'createContact'}
                edit={edit}
                oldName={contact && contact.name}
                initialValues={
                  edit
                    ? getInitialValues(contact)
                    : { ...initialContact, ...prefill }
                }
                closeModal={closeModal}
              />
            </ControlledModal.Body>
          </>
        )}
      </ControlledModal>
    );
  }
}

export default AddEditContactModal;
