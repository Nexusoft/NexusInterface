// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import rpc from 'lib/rpc';
import { defaultSettings } from 'lib/settings/universal';
import { loadAccounts, updateAccountBalances } from 'lib/user';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import FormField from 'components/FormField';
import { openConfirmDialog, openSuccessDialog, openModal } from 'lib/ui';
import { errorHandler } from 'utils/form';
import sendIcon from 'icons/send.svg';

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
    settings: { minConfirmations },
    core: {
      info: { blocks, locked, minting_only },
    },
    form,
  } = state;
  const accountName = valueSelector(state, 'sendFrom');
  const recipients = valueSelector(state, 'recipients');
  const accBalance = getAccountBalance(accountName, myAccounts);
  const hideSendAll =
    recipients &&
    (recipients.length > 1 ||
      (recipients[0] && recipients[0].amount === accBalance));
  return {
    minConfirmations,
    locked,
    blocks,
    minting_only,
    accountOptions: getAccountOptions(myAccounts),
    addressNameMap: getAddressNameMap(addressBook),
    fieldNames: getRegisteredFieldNames(
      form[formName] && form[formName].registeredFields
    ),
    accBalance: hideSendAll ? undefined : accBalance,
  };
};

/**
 * The Internal Send Form in the Send Page
 *
 * @class SendForm
 * @extends {Component}
 */
@connect(mapStateToProps)
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
    message: '',
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
    let minConfirmations = parseInt(props.minConfirmations);
    if (isNaN(minConfirmations)) {
      minConfirmations = defaultSettings.minConfirmations;
    }

    if (recipients.length === 1) {
      const recipient = recipients[0];
      const params = [
        sendFrom,
        recipient.address,
        parseFloat(recipient.amount),
        minConfirmations,
        message || null,
        null,
      ];
      if (password) params.push(password);
      // if (message) params.push(message);
      return rpc('sendfrom', params);
    } else {
      const queue = recipients.reduce(
        (queue, r) => ({ ...queue, [r.address]: parseFloat(r.amount) }),
        {}
      );
      return rpc('sendmany', [sendFrom, queue], minConfirmations, message);
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    loadAccounts();
    openSuccessDialog({
      message: __('Transaction sent'),
    });
  },
  onSubmitFail: errorHandler(__('Error sending NXS')),
})
class SendForm extends Component {
  componentDidMount() {
    loadAccounts();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.blocks !== this.props.blocks) {
      updateAccountBalances();
    }
  }

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
    //   } = openErrorDialog({
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
    //             removeModal(modalId);
    //           }}
    //         >
    //           {__('Log in now')}
    //         </Link>
    //       </>
    //     ),
    //   });
    //   return;
    // }

    openConfirmDialog({
      question: __('Send transaction?'),
      callbackYes: () => {
        if (locked || minting_only) {
          openModal(PasswordModal, {
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
        />

        <FormField connectLabel label={__('Message')}>
          <Field
            component={TextField.RF}
            name="message"
            multiline
            rows={1}
            placeholder={__('Enter your message')}
          />
        </FormField>

        <SendFormButtons>
          <FieldArray
            component={this.renderAddRecipientButton}
            name="recipients"
          />

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
