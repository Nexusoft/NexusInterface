// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import Button from 'components/Button';
import UIController from 'components/UIController';
import * as RPC from 'scripts/rpc';
import { loadMyAccounts } from 'actions/accountActionCreators';
import { rpcErrorHandler } from 'utils/form';

const NewAddressFormComponent = styled.form({
  marginTop: '2em',
});

const AccountNameInput = styled.div({
  flexGrow: 1,
  marginLeft: '1em',
});

const Buttons = styled.div({
  marginTop: '2em',
  display: 'flex',
  justifyContent: 'space-between',
});

/**
 * Handles the new address form from the header
 *
 * @class NewAddressForm
 * @extends {React.Component}
 */
@connect(state => ({
  accountNames: (state.addressbook.myAccounts || []).map(acc => acc.account),
}))
@reduxForm({
  form: 'newAddress',
  initialValues: {
    accountName: '',
  },
  validate: ({ accountName }) => {
    const errors = {};
    if (!accountName) {
      errors.accountName = 'Account name is required';
    }
    if (accountName === '*') {
      errors.accountName = 'Invalid account name';
    }
    return errors;
  },
  onSubmit: ({ accountName }) => RPC.PROMISE('getnewaddress', [accountName]),
  onSubmitSuccess: (result, dispatch, props) => {
    dispatch(loadMyAccounts());
    props.finish();
    UIController.showNotification('New address has been created', 'success');
  },
  onSubmitFail: rpcErrorHandler('Error creating new address'),
})
class NewAddressForm extends React.Component {
  /**
   * Sets the account name
   *
   * @memberof NewAddressForm
   */
  setAccountName = name => {
    this.props.change('accountName', name);
  };

  /**
   * React Render
   *
   * @returns
   * @memberof NewAddressForm
   */
  render() {
    const { handleSubmit, submitting, accountNames, finish } = this.props;
    return (
      <NewAddressFormComponent onSubmit={handleSubmit}>
        <div className="flex center">
          <span>Account name:</span>
          <AccountNameInput>
            <Field
              component={AutoSuggest.RF}
              name="accountName"
              suggestions={accountNames}
              onSelect={this.setAccountName}
              inputProps={{
                placeholder:
                  'Enter a new account name or pick an existing account',
              }}
            />
          </AccountNameInput>
        </div>
        <Buttons>
          <Button onClick={finish}>Cancel</Button>
          <Button type="submit" skin="primary" disabled={submitting}>
            Create Address
          </Button>
        </Buttons>
      </NewAddressFormComponent>
    );
  }
}
export default NewAddressForm;