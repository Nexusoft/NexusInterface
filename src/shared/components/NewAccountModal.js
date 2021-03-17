import { Component } from 'react';
import { reduxForm, Field } from 'redux-form';
import { connect } from 'react-redux';

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

__ = __context('NewAccount');

const getSuggestions = memoize((userTokens) => [
  'NXS',
  ...(userTokens ? userTokens.map((t) => t.name || t.address) : []),
]);

@connect((state, props) => ({
  suggestions:
    props.tokenName || props.tokenAddress
      ? []
      : getSuggestions(state.user.tokens),
  initialValues: {
    name: '',
    token: props.tokenName || props.tokenAddress || 'NXS',
  },
}))
@reduxForm({
  form: 'new_account',
  destroyOnUnmount: true,
  validate: ({ name, token }) => {
    const errors = {};
    if (!token) {
      errors.token = __('Token name/address is required');
    }

    return errors;
  },
  onSubmit: async ({ name, token }, dispatch, props) => {
    if (!name) {
      const confirmed = await confirm({
        question: __('Create an account without a name?'),
        note: __('Adding a name costs a NXS fee'),
        labelYes: __("That's Ok"),
        labelNo: __('Cancel'),
      });

      if (!confirmed) {
        return;
      }
    }
    const pin = await confirmPin();
    if (pin) {
      const params = { pin };
      if (name) params.name = name;

      if (token === 'NXS') {
        return await callApi('finance/create/account', params);
      } else {
        if (addressRegex.test(token)) {
          try {
            // Test if `token` is the token address
            params.token = token;
            return await callApi('tokens/create/account', params);
          } catch (err) {}
        }

        // Assuming `token` is token name
        try {
          params.token_name = token;
          return await callApi('tokens/create/account', params);
        } catch (err) {
          openErrorDialog({
            message: __('Error creating account'),
            note: __('Unknown token name/address'),
          });
        }
      }
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    if (!result) return; // Submission was cancelled
    GA.SendEvent('Users', 'NewAccount', 'Accounts', 1);
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
class NewAccountModal extends Component {
  render() {
    const {
      handleSubmit,
      submitting,
      suggestions,
      tokenName,
      tokenAddress,
    } = this.props;
    const tokenPreset = !!(tokenName || tokenAddress);

    return (
      <Modal
        assignClose={(closeModal) => {
          this.closeModal = closeModal;
        }}
        maxWidth={700}
      >
        <Modal.Header>{__('New account')}</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <FormField
              connectLabel
              label={__('Account name (%{nameFee} NXS Fee) (Optional)', {
                nameFee: createLocalNameFee,
              })}
            >
              <Field
                name="name"
                component={TextField.RF}
                placeholder={__("New account's name")}
              />
            </FormField>

            <FormField connectLabel label={__('Token name/address')}>
              <Field
                name="token"
                component={AutoSuggest.RF}
                suggestions={suggestions}
                filterSuggestions={(suggestions) => suggestions}
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

export default NewAccountModal;
