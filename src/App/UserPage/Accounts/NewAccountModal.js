import React from 'react';
import { reduxForm, Field } from 'redux-form';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import confirmPin from 'utils/promisified/confirmPin';
import { apiPost } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { listAccounts } from 'lib/user';
import { removeModal, showNotification } from 'lib/ui';

@reduxForm({
  form: 'new_account',
  destroyOnUnmount: true,
  initialValues: {
    name: '',
  },
  validate: ({ name }) => {
    const errors = {};
    if (!name) {
      errors.name = __('Name is required');
    }

    return errors;
  },
  onSubmit: async ({ name }) => {
    const pin = await confirmPin();
    if (pin) {
      return await apiPost('finance/create/account', { pin, name });
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled

    listAccounts();
    removeModal(props.modalId);
    showNotification(
      __('New account %{account} has been created', {
        account: props.values.name,
      }),
      'success'
    );
  },
  onSubmitFail: errorHandler(__('Error creating account')),
})
export default class NewAccountModal extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    return (
      <Modal
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
        style={{ maxWidth: 400 }}
      >
        <Modal.Header>{__('New account')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField connectLabel label={__('Account name')}>
              <Field
                name="name"
                component={TextField.RF}
                placeholder={__("New account's name")}
              />
            </FormField>

            <div className="mt3 flex space-between">
              <Button
                onClick={() => {
                  this.closeModal();
                }}
              >
                {__('Cancel')}
              </Button>
              <Button skin="primary" type="submit" disabled={submitting}>
                {__('Create account')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
