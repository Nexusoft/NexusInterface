// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import AutoSuggest from 'components/AutoSuggest';
import Button from 'components/Button';
import { showNotification } from 'actions/overlays';
import rpc from 'lib/rpc';
import { loadMyAccounts } from 'actions/account';
import { rpcErrorHandler } from 'utils/form';

const NewAddressFormComponent = styled.form({
  marginTop: '2em',
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
@connect(
  state => ({
    accountNames: (state.myAccounts || []).map(acc => acc.account),
  }),
  { showNotification }
)
@reduxForm({
  form: 'newAddress',
  initialValues: {
    accountName: '',
  },
  validate: ({ accountName }) => {
    const errors = {};
    if (!accountName) {
      errors.accountName = _('Account name is required');
    }
    if (accountName === '*') {
      errors.accountName = _('Invalid account name');
    }
    return errors;
  },
  onSubmit: ({ accountName }) => rpc('getnewaddress', [accountName]),
  onSubmitSuccess: (result, dispatch, props) => {
    dispatch(loadMyAccounts());
    props.finish();
    props.showNotification(_('New address has been created'), 'success');
  },
  onSubmitFail: rpcErrorHandler(_('Error creating new address')),
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
        <div>{_('Enter a new account name or pick an existing account:')}</div>
        <Field
          component={AutoSuggest.RF}
          name="accountName"
          suggestions={accountNames}
          onSelect={this.setAccountName}
          inputProps={{
            placeholder: _('Account name'),
          }}
        />
        <Buttons>
          <Button onClick={finish}>{_('Cancel')}</Button>
          <Button type="submit" skin="primary" disabled={submitting}>
            {_('Create Address')}
          </Button>
        </Buttons>
      </NewAddressFormComponent>
    );
  }
}
export default NewAddressForm;
