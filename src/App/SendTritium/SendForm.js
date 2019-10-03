// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray, formValueSelector } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import { apiPost } from 'lib/tritiumApi';
import rpc from 'lib/rpc';
import { defaultSettings } from 'lib/settings/universal';
import { listAccounts } from 'lib/user';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import FormField from 'components/FormField';
import Tooltip from 'components/Tooltip';
import Arrow from 'components/Arrow';
import { openSuccessDialog } from 'lib/ui';
import { errorHandler } from 'utils/form';
import sendIcon from 'images/send.sprite.svg';
import { numericOnly } from 'utils/form';
import confirmPin from 'utils/promisified/confirmPin';
import questionIcon from 'images/question-mark-circle.sprite.svg';

// Internal Local
import Recipients from './Recipients';
import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
  getAccountBalance,
} from './selectors';

const SendFormComponent = styled.form({
  maxWidth: 800,
  margin: '-.5em auto 0',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '2em',
});

const OptionsArrow = styled.span({
  display: 'inline-block',
  width: 15,
  verticalAlign: 'middle',
});

const MoreOptions = styled.div({
  paddingLeft: '1em',
});

const formName = 'sendNXS';
const valueSelector = formValueSelector(formName);
const mapStateToProps = state => {
  const {
    addressBook,
    settings: { minConfirmations },
    core: {
      info: { locked, minting_only },
      accounts,
    },
    form,
  } = state;
  const accountName = valueSelector(state, 'sendFrom');
  const recipients = valueSelector(state, 'recipients');
  const reference = valueSelector(state, 'reference');
  const expires = valueSelector(state, 'expires');
  const accBalance = getAccountBalance(accountName, accounts);
  const hideSendAll =
    recipients &&
    (recipients.length > 1 ||
      (recipients[0] && recipients[0].amount === accBalance));
  return {
    minConfirmations,
    locked,
    reference,
    expires,
    minting_only,
    accountName,
    accountOptions: getAccountOptions(accounts),
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
    reference: null,
    expires: null,
  },
  validate: ({ sendFrom, recipients, reference, expires }) => {
    const errors = {};
    if (!sendFrom) {
      errors.sendFrom = __('No accounts selected');
    }
    if (reference) {
      if (!reference.match('^[0-9]+$')) {
        errors.reference = __('Reference must be a number');
      } else {
        if (parseInt(reference) > 18446744073709551615) {
          errors.reference = __('Number is too large');
        }
      }
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
    const recipientInputSize = new Blob([recipients[0].address]).size;

    const isAddress =
      recipientInputSize === 51 &&
      recipients[0].address.match(/([0OIL+/])/g) === null;

    if (isAddress) {
      if (
        !recipients[0].address.startsWith('2') &&
        !recipients[0].address.startsWith('4') &&
        !recipients[0].address.startsWith('8')
      ) {
        throw { recipients: [{ address: __('Invalid address') }] };
      }
    }

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
  onSubmit: async (
    { sendFrom, recipients, reference, expires },
    dispatch,
    props
  ) => {
    const pin = await confirmPin();
    if (pin) {
      const params = {
        pin,
        name: sendFrom,
        amount: parseFloat(recipients[0].amount),
      };

      const recipientInputSize = new Blob([recipients[0].address]).size;
      const isAddress =
        recipientInputSize === 51 &&
        recipients[0].address.match(/([0OIL+/])/g) === null;

      isAddress
        ? (params.address_to = recipients[0].address)
        : (params.name_to = recipients[0].address);
      if (reference) params.reference = reference;
      if (expires) params.expires = expires;
      return await apiPost('finance/debit/account', params);
    }

    let minConfirmations = parseInt(props.minConfirmations);
    if (isNaN(minConfirmations)) {
      minConfirmations = defaultSettings.minConfirmations;
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    if (!result) return;

    props.reset();
    listAccounts();
    openSuccessDialog({
      message: __('Transaction sent'),
    });
  },
  onSubmitFail: errorHandler(__('Error sending NXS')),
})
class SendForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionalOpen: false,
    };
  }

  componentDidUpdate(prevProps) {
    // if you have EVER added to these items always show till form is reset.

    if (this.props.reference || this.props.expires) {
      if (
        this.props.reference !== prevProps.reference ||
        this.props.expires !== prevProps.expires
      ) {
        this.setState({
          optionalOpen: true,
        });
      }
    }
  }

  componentDidMount() {
    // if ref or experation was in the form then open the optionals.
    // form is NOT reset on component unmount so we must show it on mount
    if (this.props.reference || this.props.expires) {
      this.setState({
        optionalOpen: true,
      });
    }
  }

  /**
   * Confirm the Send
   *
   * @memberof SendForm
   */
  confirmSend = e => {
    e.preventDefault();
    const { handleSubmit, invalid, touch, fieldNames } = this.props;

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown.
      // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
      // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }
    handleSubmit();
  };

  toggleMoreOptions = e => {
    this.setState({
      optionalOpen: !this.state.optionalOpen,
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
    const optionsOpen =
      this.state.optionalOpen || this.props.reference || this.props.expires;

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
          sendFrom={{
            token: '0',
            name: this.props.accountName,
            tokenAddress: '0',
          }}
        />

        <div className="mt1" style={{ opacity: 0.7 }}>
          <Button onClick={this.toggleMoreOptions} skin="hyperlink">
            <OptionsArrow>
              <Arrow
                direction={optionsOpen ? 'down' : 'right'}
                height={8}
                width={10}
              />
            </OptionsArrow>
            <span className="v-align">{__('More options')}</span>
          </Button>
        </div>
        {optionsOpen && (
          <MoreOptions>
            {' '}
            <FormField
              label={
                <span>
                  <span className="v-align">{__('Reference number')}</span>
                  <Tooltip.Trigger
                    position="right"
                    tooltip={__(
                      'An optional number which may be provided by the recipient to identify this transaction from the others'
                    )}
                  >
                    <Icon icon={questionIcon} className="space-left" />
                  </Tooltip.Trigger>
                </span>
              }
            >
              <Field
                component={TextField.RF}
                name="reference"
                normalize={numericOnly}
                placeholder={__(
                  'Invoice number, order number, etc... (Optional)'
                )}
              />
            </FormField>
            {/*<FormField label={__('Expiration')}>
              <Field
                component={TextField.RF}
                name="expires"
                placeholder={__('Seconds till experation (Optional)')}
              />
        </FormField>{' '}*/}
          </MoreOptions>
        )}

        <SendFormButtons>
          <Button type="submit" skin="primary" wide>
            <Icon icon={sendIcon} className="space-right" />
            {__('Send')}
          </Button>
        </SendFormButtons>
      </SendFormComponent>
    );
  }
}

export default SendForm;
