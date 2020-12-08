import { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { useSelector } from 'react-redux';

import Modal from 'components/Modal';
import Button from 'components/Button';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import AutoSuggest from 'components/AutoSuggest';
import { confirm } from 'lib/ui';
import { confirmPin } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';
import { errorHandler } from 'utils/form';
import { loadAccounts } from 'lib/user';
import { removeModal, showNotification, openErrorDialog } from 'lib/ui';
import { createLocalNameFee } from 'lib/fees';
import GA from 'lib/googleAnalytics';
import memoize from 'utils/memoize';
import { addressRegex } from 'consts/misc';

__ = __context('RenameAccount');

const getSuggestions = memoize((userTokens) => [
  'NXS',
  ...(userTokens ? userTokens.map((t) => t.name || t.address) : []),
]);

@reduxForm({
  form: 'rename_account',
  destroyOnUnmount: true,
  validate: ({ name }) => {
    const errors = {};
    if (!name) {
      errors.name = __('Account name is required');
    }
    return errors;
  },
  onSubmit: async (
    { name, token },
    dispatch,
    { username, accountName, accountAddress }
  ) => {
    let nameRecord;
    try {
      nameRecord = await callApi('names/get/name', {
        name: `${username}:${name}`,
      });
      if (nameRecord?.register_address && nameRecord.register_address !== '0') {
        openErrorDialog({
          message: __('Reuse existing name?'),
          note: __(
            'Your chosen account name %{account_name} is already in use. Please choose another name.',
            {
              account_name: name,
            }
          ),
        });
        return;
      }
    } catch (err) {
      if (err.code !== -101) {
        throw err;
      }
    }

    const pin = await confirmPin();
    if (pin) {
      await callApi(nameRecord ? 'names/update/name' : 'names/create/name', {
        pin,
        name,
        register_address: accountAddress,
      });

      if (accountName) {
        await callApi('names/update/name', {
          pin,
          name: accountName,
          register_address: '0',
        });
      }

      return true;
    }
  },
  onSubmitSuccess: (result, dispatch, { modalId, values: { name } }) => {
    if (!result) return; // Submission was cancelled
    GA.SendEvent('Users', 'RenameAccount', 'Accounts', 1);
    loadAccounts();
    removeModal(modalId);
    showNotification(
      __('Account has been renamed to %{account_name}', {
        account_name: name,
      }),
      'success'
    );
  },
  onSubmitFail: errorHandler(__('Error renaming account')),
})
class RenameAccountForm extends Component {
  render() {
    const { accountName, handleSubmit, submitting, pristine } = this.props;
    return (
      <Modal
        assignClose={(closeModal) => {
          this.closeModal = closeModal;
        }}
        maxWidth={600}
      >
        <Modal.Header>{__('Rename account')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField connectLabel label={__('Account name')}>
              <Field name="name" component={TextField.RF} autoFocus />
            </FormField>

            <div className="mt1">
              {__('Account renaming fee')}:{' '}
              {createLocalNameFee * (accountName ? 2 : 1)} NXS
            </div>

            <div className="mt3 flex space-between">
              <Button
                onClick={() => {
                  this.closeModal();
                }}
              >
                {__('Cancel')}
              </Button>
              <Button
                skin="primary"
                type="submit"
                disabled={submitting || pristine}
              >
                {submitting ? __('Renaming') + '...' : __('Rename')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default function RenameAccountModal({ account, modalId }) {
  const username = useSelector((state) => state.user.status?.username);
  return (
    <RenameAccountForm
      initialValues={{ name: account.name }}
      accountName={account.name}
      accountAddress={account.address}
      username={username}
      modalId={modalId}
    />
  );
}
