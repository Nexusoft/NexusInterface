import { useSelector } from 'react-redux';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { formSubmit, required } from 'lib/form';
import { confirmPin, openErrorDialog } from 'lib/dialog';
import { callApi } from 'lib/api';
import { loadAccounts } from 'lib/user';
import { showNotification } from 'lib/ui';
import { createLocalNameFee } from 'lib/fees';
import { selectUsername } from 'lib/user';
import memoize from 'utils/memoize';
import GA from 'lib/googleAnalytics';
import { useState } from 'react';

__ = __context('RenameAccount');

const getFee = (nameRecord) => (nameRecord ? 0 : 1);

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
      nameRecord = await callApi('names/get/inactive', {
        name: `${username}:${name}`,
      });
      if (!nameRecord) {
        throw err;
      }
    }
  }

  // Check if balance is enough to pay the fee, otherwise user might
  // end up creating a new name without nullifying the old name
  const fee = getFee(nameRecord);
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
    if (account.name) {
      await callApi('names/rename/name', {
        pin,
        name: account.name,
        new: name,
      });
    } else {
      await callApi('names/create/name', {
        pin,
        name,
        register: account.address,
      });
    }

    return true;
  }
}

async function isAvailable({ name, username }) {
  let nameRecord;
  try {
    nameRecord = await callApi('names/get/name', {
      name: `${username}:${name}`,
    });
  } catch (err) {
    if (err.code !== -101) {
      nameRecord = await callApi('names/get/inactive', {
        name: `${username}:${name}`,
      });
    }
  }
  return !!nameRecord;
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
  // If you already own a name but is inactive, you do not need to pay a fee.
  const [alreadyOwn, setIsOwned] = useState(false);

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
              subscription={{
                submitting: true,
                pristine: true,
              }}
              validate={async ({ name }) => {
                setIsOwned(await isAvailable({ name, username }));
                return {};
              }}
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
                    {createLocalNameFee * getFee(alreadyOwn)} NXS
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
