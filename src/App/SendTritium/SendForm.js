// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import { apiPost } from 'lib/tritiumApi';
import rpc from 'lib/rpc';
import { defaultSettings } from 'lib/settings';
import { loadMyAccounts } from 'actions/account';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import FormField from 'components/FormField';
import {
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
  openModal,
} from 'actions/overlays';
import Link from 'components/Link';
import { errorHandler } from 'utils/form';
import sendIcon from 'images/send.sprite.svg';

import PinDialog from 'components/PinDialog';

// Internal Local
import Recipients from './Recipients';
import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
  getAccountBalance,
} from './selectors';
import PasswordModal from './PasswordModal';

const SendFormComponent = styled.form({
  maxWidth: 800,
  margin: '-.5em auto 0',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '2em',
});

const formName = 'sendNXS';
const valueSelector = formValueSelector(formName);
const mapStateToProps = state => {
  const {
    addressBook,
    myAccounts,
    myTritiumAccounts,
    settings: { minConfirmations },
    core: {
      info: { locked, minting_only },
    },
    form,
  } = state;
  const accountName = valueSelector(state, 'sendFrom');
  const recipients = valueSelector(state, 'recipients');
  const accBalance = getAccountBalance(accountName, myTritiumAccounts);
  const hideSendAll =
    recipients &&
    (recipients.length > 1 ||
      (recipients[0] && recipients[0].amount === accBalance));
  return {
    minConfirmations,
    locked,
    minting_only,
    accountOptions: getAccountOptions(myTritiumAccounts),
    addressNameMap: getAddressNameMap(addressBook),
    fieldNames: getRegisteredFieldNames(
      form[formName] && form[formName].registeredFields
    ),
    accBalance: hideSendAll ? undefined : accBalance,
  };
};

const mapDispatchToProps = {
  loadMyAccounts,
  openConfirmDialog,
  openErrorDialog,
  openSuccessDialog,
  removeModal,
  openModal,
};

/**
 * The Internal Send Form in the Send Page
 *
 * @class SendForm
 * @extends {Component}
 */
@connect(
  mapStateToProps,
  mapDispatchToProps
)
@reduxForm({
  form: formName,
  destroyOnUnmount: false,
  initialValues: {
    sendFrom: null,
    recipients: [
      {
        address: null,
        amount: '',
        fiatAmount: '',
      },
    ],
    password: null,
    reference: null,
    expires: null,
  },
  validate: ({ sendFrom, recipients }) => {
    const errors = {};
    if (!sendFrom) {
      errors.sendFrom = __('No accounts selected');
    }

    if (!recipients || !recipients.length) {
      errors.recipients = {
        _error: __('There must be at least one recipient'),
      };
    } else {
      const recipientsErrors = [];

      recipients.forEach(({ address, amount }, i) => {
        const recipientErrors = {};
        if (!address) {
          recipientErrors.address = __('Address is required');
        }
        const floatAmount = parseFloat(amount);
        if (!floatAmount || floatAmount < 0) {
          recipientErrors.amount = __('Invalid amount');
        }
        if (Object.keys(recipientErrors).length) {
          recipientsErrors[i] = recipientErrors;
        }
      });

      if (recipientsErrors.length) {
        errors.recipients = recipientsErrors;
      }
    }

    return errors;
  },
  asyncBlurFields: ['recipients[].address'],
  asyncValidate: async ({ recipients }) => {
    return null;
    const recipientsErrors = [];
    await Promise.all(
      recipients.map(({ address }, i) =>
        rpc('validateaddress', [address])
          .then(result => {
            if (!result.isvalid) {
              recipientsErrors[i] = {
                address: __('Invalid address'),
              };
            } else if (result.ismine) {
              recipientsErrors[i] = {
                address: __('This is an address registered to this wallet.'),
              };
            }
          })
          .catch(err => {
            recipientsErrors[i] = {
              address: __('Invalid address'),
            };
          })
      )
    );
    if (recipientsErrors.length) {
      throw { recipients: recipientsErrors };
    }
    return null;
  },
  onSubmit: ({ sendFrom, recipients, message, password }, dispatch, props) => {
    console.log('Submit');
    props.openModal(PinDialog, {
      confirmLabel: __('Unlock'),
      onConfirm: async pin => {
        try {
          console.log(pin);
          const recipient = recipients[0];
          const params = [
            sendFrom,
            recipient.address,
            parseFloat(recipient.amount),
            minConfirmations,
            message || null,
            null,
            password || null,
          ];
          console.log(password);
          console.log(params);
          return apiPost('/finance/debit/account', params);
        } catch (err) {
          console.error(err);
          handleError(err);
        }
      },
    });

    let minConfirmations = parseInt(props.minConfirmations);
    if (isNaN(minConfirmations)) {
      minConfirmations = defaultSettings.minConfirmations;
    }

    if (recipients.length === 1) {
    } else {
      const queue = recipients.reduce(
        (queue, r) => ({ ...queue, [r.address]: parseFloat(r.amount) }),
        {}
      );
      //return rpc('sendmany', [sendFrom, queue], minConfirmations, message);
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    props.loadMyAccounts();
    props.openSuccessDialog({
      message: __('Transaction sent'),
    });
  },
  onSubmitFail: errorHandler(__('Error sending NXS')),
})
class SendForm extends Component {
  /**
   * Confirm the Send
   *
   * @memberof SendForm
   */
  confirmSend = e => {
    e.preventDefault();
    const {
      handleSubmit,
      invalid,
      locked,
      minting_only,
      touch,
      fieldNames,
    } = this.props;

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown.
      // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
      // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }

    // if (locked) {
    //   const {
    //     payload: { id: modalId },
    //   } = this.props.openErrorDialog({
    //     message: 'You are not logged in',
    //     note: (
    //       <>
    //         <p>
    //           {__(
    //             'You need to log in to your wallet before sending transactions'
    //           )}
    //         </p>
    //         <Link
    //           to="/Settings/Security"
    //           onClick={() => {
    //             this.props.removeModal(modalId);
    //           }}
    //         >
    //           {__('Log in now')}
    //         </Link>
    //       </>
    //     ),
    //   });
    //   return;
    // }

    this.props.openModal(PinDialog, {
      confirmLabel: __('Unlock'),
      onConfirm: async pin => {
        try {
          console.log(this);
          console.log(props);
          this.props.openConfirmDialog({
            question: __('Send transaction?'),
            callbackYes: () => {
              if (locked || minting_only) {
                this.props.openModal(PasswordModal, {
                  onSubmit: password => {
                    this.props.change('password', password);
                    // change function seems to be asynchronous
                    // so setTimeout to wait for it to take effect
                    setTimeout(handleSubmit, 0);
                  },
                });
              } else {
                handleSubmit();
              }
            },
          });
        } catch (err) {
          console.error(err);
          handleError(err);
        }
      },
    });
  };

  /**
   * Add Recipient to the queue
   *
   * @memberof SendForm
   */
  addRecipient = () => {
    this.props.array.push('recipients', {
      address: null,
      amount: '',
      fiatAmount: '',
    });
  };

  /**
   * Return JSX for the Add Recipient Button
   *
   * @memberof SendForm
   */
  renderAddRecipientButton = ({ fields }) =>
    //BEING REMOVED TILL NEW API SUPPORTS MULTI SEND
    fields.length === 1 ? (
      <Button onClick={this.addRecipient}>
        {__('Send To multiple recipients')}
      </Button>
    ) : (
      <div />
    );

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof SendForm
   */
  render() {
    const { accountOptions, change, accBalance } = this.props;

    return (
      <SendFormComponent onSubmit={this.confirmSend}>
        <FormField label={__('Send from')}>
          <Field
            component={Select.RF}
            name="sendFrom"
            placeholder={__('Select an account')}
            options={accountOptions}
          />
        </FormField>

        <FieldArray
          component={Recipients}
          name="recipients"
          change={change}
          addRecipient={this.addRecipient}
          accBalance={accBalance}
          token={'0'}
        />

        <FormField label={__('Reference')}>
          <Field
            component={TextField.RF}
            name="reference"
            placeholder={__('ulong (Optional)')}
          />
        </FormField>

        <FormField label={__('Expiration')}>
          <Field
            component={TextField.RF}
            name="expiration"
            placeholder={__('Seconds till experation (Optional)')}
          />
        </FormField>

        <SendFormButtons>
          <Button type="submit" skin="primary">
            <Icon icon={sendIcon} className="space-right" />
            {__('Send')}
          </Button>
        </SendFormButtons>
      </SendFormComponent>
    );
  }
}

export default SendForm;
