import { useSelector } from 'react-redux';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { formSubmit, required } from 'lib/form';
import { confirmPin, openErrorDialog } from 'lib/dialog';
import { callApi } from 'lib/tritiumApi';
import { loadAccounts } from 'lib/user';
import { showNotification } from 'lib/ui';
import { createLocalNameFee } from 'lib/fees';
import { selectUsername } from 'lib/user';
import memoize from 'utils/memoize';
import GA from 'lib/googleAnalytics';

__ = __context('RenameAccount');

const getFee = (accountName) => (accountName ? 2 : 1);

const getInitialValues = memoize((accountName) => ({ name: accountName }));

async function submit({ name, account, username }) {
  let nameRecord;
  try {
    nameRecord = await callApi('names/get/name', {
      name: `${username}:${name}`,
    });
    if (nameRecord?.register && nameRecord.register !== '0') {
      openErrorDialog({
        message: __('Name already in use'),
        note: __(
          'The name you entered is already in use. Please choose another name.'
        ),
      });
      return;
    }
  } catch (err) {
    if (err.code !== -101) {
      throw err;
    }
  }

  // Check if balance is enough to pay the fee, otherwise user might
  // end up creating a new name without nullifying the old name
  const fee = getFee(account.name);
  const defaultAccount = await callApi('finance/get/account', {
    name: 'default',
  });
  if (defaultAccount.balance < fee) {
    openErrorDialog({
      message: __('Insufficient balance'),
      note: __('Your default account balance is not enough to pay the fee.'),
    });
    return;
  }

  const pin = await confirmPin();
  if (pin) {
    await callApi(nameRecord ? 'names/update/name' : 'names/create/name', {
      pin,
      name,
      register: account.address,
    });

    if (account.name) {
      await callApi('names/update/name', {
        pin,
        name: account.name,
        register: '0',
      });
    }

    return true;
  }
}

function handleSubmitSuccess({ result, name, closeModal }) {
  if (!result) return; // Submission was cancelled
  GA.SendEvent('Users', 'RenameAccount', 'Accounts', 1);
  loadAccounts();
  closeModal();
  showNotification(
    __('Account has been renamed to %{account_name}', {
      account_name: name,
    }),
    'success'
  );
}

export default function RenameAccountForm({ account }) {
  const username = useSelector(selectUsername);

  return (
    <ControlledModal maxWidth={600}>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Rename account')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <Form
              name="rename_account"
              initialValues={getInitialValues(account.name)}
              onSubmit={formSubmit({
                submit: ({ name }) => submit({ name, account, username }),
                onSuccess: (result, { name }) =>
                  handleSubmitSuccess({ result, name, closeModal }),
                errorMessage: __('Error renaming account'),
              })}
              subscription={{ submitting: true, pristine: true }}
            >
              {({ submitting, pristine }) => (
                <>
                  <FormField connectLabel label={__('Account name')}>
                    <Form.TextField
                      name="name"
                      autoFocus
                      validate={required()}
                    />
                  </FormField>

                  <div className="mt1">
                    {__('Account renaming fee')}:{' '}
                    {createLocalNameFee * getFee(account.name)} NXS
                  </div>

                  <div className="mt3 flex space-between">
                    <Button onClick={closeModal}>{__('Cancel')}</Button>
                    <Form.SubmitButton
                      skin="primary"
                      disabled={submitting || pristine}
                    >
                      {submitting ? __('Renaming') + '...' : __('Rename')}
                    </Form.SubmitButton>
                  </div>
                </>
              )}
            </Form>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
