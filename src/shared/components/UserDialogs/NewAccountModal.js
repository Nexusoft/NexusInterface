import React from 'react';
import { reduxForm, Field } from 'redux-form';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import confirm from 'utils/promisified/confirm';
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
  },
  validate: ({ name }) => {
    const errors = {};

    return errors;
  },
  onSubmit: async ({ name }, dispatch, props) => {
    if (!name) {
      const confirmed = await confirm({
        question: __('Create a account without a name?'),
        note: __('Adding a name costs a NXS fee'),
        labelYes: __("That's Ok"),
        labelNo: __('Cancel'),
      });

      if (!confirmed) {
        throw { name: __('Add Name') };
      }
    }
    const pin = await confirmPin();
    if (pin) {
      const params = { pin };
      if (name) params.name = name;

      if (props.tokenName === 'NSX') {
        return await apiPost('finance/create/account', params);
      } else {
        if (props.tokenName) params.token_name = props.tokenName;
        if (props.tokenAddress) params.token = props.tokenAddress;
        return await apiPost('tokens/create/account', params);
      }
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
            <FormField connectLabel label={__('Account name (1 NXS Fee)')}>
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
                {submitting
                  ? __('Creating account') + '...'
                  : __('Create account')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}
