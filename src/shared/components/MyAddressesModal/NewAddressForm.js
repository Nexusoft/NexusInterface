// External
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Form from 'components/Form';
import Button from 'components/Button';
import { formSubmit, checkAll, required } from 'lib/form';
import { showNotification } from 'lib/ui';
import rpc from 'lib/rpc';
import { loadAccounts } from 'lib/user';

__ = __context('MyAddresses.NewAddressForm');

const Buttons = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
});

const initialValues = {
  accountName: '',
};

const validName = (value) => value === '*' && __('Invalid account name');

export default function NewAddressForm({ finish }) {
  const accountNames = useSelector((state) =>
    (state.myAccounts || []).map((acc) => acc.account)
  );
  return (
    <Form
      name="newAddress"
      initialValues={initialValues}
      onSubmit={formSubmit({
        submit: ({ accountName }) => rpc('getnewaddress', [accountName]),
        onSuccess: () => {
          loadAccounts();
          finish();
          showNotification(__('New address has been created'), 'success');
        },
        errorMessage: __('Error creating new address'),
      })}
    >
      <div className="mt2">
        <div>{__('Enter a new account name or pick an existing account:')}</div>
        <Form.AutoSuggest
          name="accountName"
          suggestions={accountNames}
          inputProps={{
            placeholder: __('Account name'),
          }}
          validate={checkAll(required(), validName)}
        />
        <Buttons>
          <Button onClick={finish}>{__('Cancel')}</Button>
          <Form.SubmitButton skin="primary">
            {__('New address')}
          </Form.SubmitButton>
        </Buttons>
      </div>
    </Form>
  );
}
