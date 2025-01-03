import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';

import Form from 'components/Form';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import FormField from 'components/FormField';
import { formSubmit, required } from 'lib/form';
import { confirmPin, openErrorDialog } from 'lib/dialog';
import { callAPI } from 'lib/api';
import { accountsQuery } from 'lib/user';
import { showNotification } from 'lib/ui';
import { createLocalNameFee } from 'lib/fees';
import { usernameAtom } from 'lib/session';
import memoize from 'utils/memoize';
import UT from 'lib/usageTracking';

__ = __context('RenameAccount');

// If you already own a name but is inactive, you do not need to pay a fee.
const getFee = (nameRecord) => (nameRecord ? 0 : createLocalNameFee);

const getInitialValues = memoize((accountName) => ({ name: accountName }));

async function submit({ name, account, username }) {
  let nameRecord;
  try {
    nameRecord = await callAPI('names/get/name', {
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
    if (err.code === -49) {
      // Error -49: Unsupported type for name/address
      // When name is inactive
      nameRecord = await callAPI('names/get/inactive', {
        name: `${username}:${name}`,
      });
      if (!nameRecord) {
        throw err;
      }
    }
  }

  const fee = getFee(nameRecord);
  const pin = await confirmPin({
    note: fee ? `${__('Fee')}: ${fee} NXS` : undefined,
  });
  if (pin) {
    if (account.name) {
      await callAPI('names/rename/name', {
        pin,
        name: account.name,
        new: name,
      });
    } else {
      await callAPI('names/create/name', {
        pin,
        name,
        register: account.address,
      });
    }

    return true;
  }
}

function handleSubmitSuccess({ result, name, closeModal }) {
  if (!result) return; // Submission was cancelled
  UT.RenameAccount();
  accountsQuery.refetch();
  closeModal();
  showNotification(
    __('Account has been renamed to %{account_name}', {
      account_name: name,
    }),
    'success'
  );
}

export default function RenameAccountForm({ account }) {
  const username = useAtomValue(usernameAtom);

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
