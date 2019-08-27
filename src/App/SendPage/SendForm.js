// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import * as Tritium from 'lib/tritiumApi';
import { defaultSettings } from 'api/settings';
import { loadMyAccounts } from 'actions/accountActionCreators';
import Text from 'components/Text';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import FormField from 'components/FormField';
import {
  openConfirmDialog,
  openModal,
  removeModal,
  openSuccessDialog,
  openErrorDialog,
} from 'actions/overlays';
import Link from 'components/Link';
import { rpcErrorHandler } from 'utils/form';
import sendIcon from 'images/send.sprite.svg';
import TritiumAmountField from './TritiumAmountField';
import { LoadTritiumAccounts } from 'actions/financeActionCreators';
import PinLoginModal from 'components/User/PinLoginModal';

// Internal Local
import Recipients from './Recipients';
import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
  getTritiumAccountOptions,
} from './selectors';

const SendFormComponent = styled.form({
  maxWidth: 800,
  margin: '0 auto',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '2em',
});

const mapStateToProps = ({
  addressBook,
  myAccounts,
  tritiumData: { tritiumAccounts },
  settings: { minConfirmations, tritium },
  common: { encrypted, loggedIn },
  form,
}) => ({
  minConfirmations,
  tritium,
  encrypted,
  loggedIn,
  tritiumAccountOptions: getTritiumAccountOptions(tritiumAccounts),
  accountOptions: getAccountOptions(myAccounts),
  addressNameMap: getAddressNameMap(addressBook),
  fieldNames: getRegisteredFieldNames(
    form.sendNXS && form.sendNXS.registeredFields
  ),
});

const mapDispatchToProps = dispatch => ({
  loadMyAccounts: () => dispatch(loadMyAccounts()),
  loadMyTritiumAccounts: () => dispatch(LoadTritiumAccounts()),
});

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
  form: 'sendNXS',
  destroyOnUnmount: false,
  initialValues: {
    sendFrom: null,
    tritiumRecipiant: { name: null, amount: '' },
    recipients: [
      {
        address: null,
        amount: '',
        fiatAmount: '',
      },
    ],
    message: '',
  },
  validate: ({ sendFrom, recipients, tritiumRecipiant }, props) => {
    const errors = {};
    if (!sendFrom) {
      errors.sendFrom = <Text id="sendReceive.Messages.NoAccounts" />;
    }
    if (props.tritium) {
      if (!tritiumRecipiant) {
        errors.recipients = {
          _error: <Text id="sendReceive.Messages.NoRecipient" />,
        };
      } else {
        const recipientsErrors = [];

        const tritiumRecipiantErrors = {};
        if (!tritiumRecipiant.name) {
          tritiumRecipiantErrors.name = <Text id="Alert.AddressEmpty" />;
        }
        const floatAmount = parseFloat(tritiumRecipiant.amount);
        if (!floatAmount || floatAmount < 0) {
          tritiumRecipiantErrors.amount = <Text id="Alert.InvalidAmount" />;
        }
        if (Object.keys(tritiumRecipiantErrors).length) {
          recipientsErrors[0] = tritiumRecipiantErrors;
        }

        if (recipientsErrors.length) {
          errors.tritiumRecipiant = tritiumRecipiantErrors;
        }
      }
    } else if (!recipients || !recipients.length) {
      errors.recipients = {
        _error: <Text id="sendReceive.Messages.NoRecipient" />,
      };
    } else {
      const recipientsErrors = [];

      recipients.forEach(({ address, amount }, i) => {
        const recipientErrors = {};
        if (!address) {
          recipientErrors.address = <Text id="Alert.AddressEmpty" />;
        }
        const floatAmount = parseFloat(amount);
        if (!floatAmount || floatAmount < 0) {
          recipientErrors.amount = <Text id="Alert.InvalidAmount" />;
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
  asyncValidate: async (
    { recipients, tritiumRecipiant, sendFrom },
    dispatch,
    props
  ) => {
    const recipientsErrors = [];

    if (props.tritium) {
      let sendFromDetails = props.tritiumAccountOptions.filter(
        acct => acct.value === sendFrom
      )[0];

      let paramsObj = { amount: tritiumRecipiant.amount, name: sendFrom };
      if (tritiumRecipiant.name.includes(':')) {
        paramsObj.name_to = tritiumRecipiant.name;
      } else {
        paramsObj.address_to = tritiumRecipiant.name;
      }

      if (sendFromDetails.isToken) {
        openModal(PinLoginModal, {
          api: 'tokens',
          verb: 'debit',
          noun: 'account',
          callback: payload => console.log(payload),
          params: paramsObj,
        });
      } else {
        let awaitPinEntryAndApiCall = await new Promise((resolve, reject) => {
          openModal(PinLoginModal, {
            api: 'finance',
            verb: 'debit',
            noun: 'account',
            callback: payload => {
              if (payload.data.error) {
                reject(payload);
              } else {
                resolve(payload);
              }
            },
            params: paramsObj,
          });
        });
        if (awaitPinEntryAndApiCall.status !== 200) {
          throw { error: awaitPinEntryAndApiCall.data.error };
        }
      }
    } else {
      await Promise.all(
        recipients.map(({ address }, i) =>
          Tritium.apiPost('RPC', 'validateaddress', [address])
            .then(result => {
              if (!result.isvalid) {
                recipientsErrors[i] = {
                  address: <Text id="Alert.InvalidAddress" />,
                };
              } else if (result.ismine) {
                recipientsErrors[i] = {
                  address: <Text id="Alert.registeredToThis" />,
                };
              }
            })
            .catch(err => {
              recipientsErrors[i] = {
                address: <Text id="Alert.InvalidAddress" />,
              };
            })
        )
      );
      if (recipientsErrors.length) {
        throw { recipients: recipientsErrors };
      }
    }
    return null;
  },
  onSubmit: (
    { sendFrom, recipients, message, tritiumRecipiant },
    dispatch,
    props
  ) => {
    let minConfirmations = parseInt(props.minConfirmations);
    if (isNaN(minConfirmations)) {
      minConfirmations = defaultSettings.minConfirmations;
    }

    if (!props.tritium) {
      if (recipients.length === 1) {
        const recipient = recipients[0];
        const params = [
          sendFrom,
          recipient.address,
          parseFloat(recipient.amount),
          minConfirmations,
        ];
        if (message) params.push(message);
        return Tritium.apiPost('RPC', 'sendfrom', params);
      } else {
        const queue = recipients.reduce(
          (queue, r) => ({ ...queue, [r.address]: parseFloat(r.amount) }),
          {}
        );

        return Tritium.apiPost(
          'RPC',
          'sendmany',
          [sendFrom, queue],
          minConfirmations,
          message
        );
      }
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    props.loadMyAccounts();
    props.loadMyTritiumAccounts();
    if (!props.tritium) {
      openSuccessDialog({
        message: <Text id="Alert.Sent" />,
      });
    }
  },
  onSubmitFail: rpcErrorHandler(
    <Text id="sendReceive.Messages.ErrorSending" />
  ),
})
class SendForm extends Component {
  componentDidMount() {
    this.props.loadMyTritiumAccounts();
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
      encrypted,
      loggedIn,
      touch,
      fieldNames,
    } = this.props;

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown.
      // redux-form doesn't have the `touchAll` feature yet so we have to list all fields manually.
      // redux-form also doesn't have the API to get all the field names yet
      // so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }

    if (encrypted && !loggedIn) {
      const modalId = openErrorDialog({
        message: 'You are not logged in',
        note: (
          <>
            <p>You need to log in to your wallet before sending transactions</p>
            <Link
              to="/Settings/Security"
              onClick={() => {
                removeModal(modalId);
              }}
            >
              Log in now
            </Link>
          </>
        ),
      });
      return;
    }

    openConfirmDialog({
      question: <Text id="sendReceive.SendTransaction" />,
      callbackYes: handleSubmit,
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
        <Text id="sendReceive.MultipleRecipients" />
      </Button>
    ) : (
      <div />
    );

  /**
   * React Render
   *
   * @returns
   * @memberof SendForm
   */
  render() {
    const {
      accountOptions,
      tritiumAccountOptions,
      change,
      tritium,
    } = this.props;
    let displayOptions = accountOptions;
    if (tritium) {
      displayOptions = tritiumAccountOptions;
    }

    return (
      <SendFormComponent onSubmit={this.confirmSend}>
        <FormField label={<Text id="sendReceive.SendFrom" />}>
          <Field
            component={Select.RF}
            name="sendFrom"
            placeholder={<Text id="sendReceive.SelectAnAccount" />}
            options={displayOptions}
          />
        </FormField>

        {tritium ? (
          <>
            <FormField label={<Text id="Finance.Recipiant" />}>
              <Field
                component={TextField.RF}
                name="tritiumRecipiant.name"
                change={change}
                placeholder="Name:Account"
              />
            </FormField>
            <TritiumAmountField change={change} />
          </>
        ) : (
          <>
            <FieldArray
              component={Recipients}
              name="recipients"
              change={change}
              addRecipient={this.addRecipient}
            />

            <Text id="sendReceive.EnterYourMessage">
              {placeholder => (
                <FormField
                  connectLabel
                  label={<Text id="sendReceive.Message" />}
                >
                  <Field
                    component={TextField.RF}
                    name="message"
                    multiline
                    rows={1}
                    placeholder={placeholder}
                  />
                </FormField>
              )}
            </Text>
          </>
        )}

        <SendFormButtons>
          {!tritium && (
            <FieldArray
              component={this.renderAddRecipientButton}
              name="recipients"
            />
          )}

          <Button type="submit" skin="primary">
            <Icon icon={sendIcon} className="space-right" />
            <Text id="sendReceive.SendNow" />
          </Button>
        </SendFormButtons>
      </SendFormComponent>
    );
  }
}

export default SendForm;
