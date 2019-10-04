import React from 'react';
import { reduxForm, Field } from 'redux-form';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import confirmPin from 'utils/promisified/confirmPin';
import { apiPost } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { loadAccounts } from 'lib/user';
import { removeModal, showNotification } from 'lib/ui';

@reduxForm({
  form: 'new_account',
  destroyOnUnmount: true,
  initialValues: {
    name: '',
    supply: 0,
    decimal: 0,
  },
  validate: ({ name }) => {
    const errors = {};
    if (!name) {
      errors.name = __('Name is required');
    }
    if (supply === 0) {
      errors.supply = __('Supply can not be zero');
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

    loadAccounts();
    removeModal(props.modalId);
    showNotification(
      __('New account %{account} has been created', {
        account: props.values.name,
      }),
      'success'
    );
  },
  onSubmitFail: errorHandler(__('Error creating token')),
})
class NewTokenModal extends React.Component {
  render() {
    const { handleSubmit, submitting } = this.props;
    const tokenCreationFee = 10; // need to wire this in.
    return (
      <Modal
        assignClose={closeModal => {
          this.closeModal = closeModal;
        }}
        style={{ maxWidth: 400 }}
      >
        <Modal.Header>{__('New Token')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField
              connectLabel
              label={__('Token name')}
              subLabel={__('Name Creation Fee: %{tokenFee}', {
                tokenFee: tokenCreationFee,
              })}
            >
              <Field
                name="name"
                component={TextField.RF}
                placeholder={__("New account's name")}
              />
            </FormField>
            <FormField
              connectLabel
              label={__('Supply')}
              subLabel={__('Max amount of tokens available')}
            >
              <Field
                name="supply"
                component={TextField.RF}
                placeholder={__('10000')}
              />
            </FormField>
            <FormField
              connectLabel
              label={__('Decimal')}
              subLabel={__('Amount of significant digits a token can have')}
            >
              <Field
                name="decimal"
                component={TextField.RF}
                placeholder={__('4')}
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
                {__('Create token')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default NewTokenModal;
