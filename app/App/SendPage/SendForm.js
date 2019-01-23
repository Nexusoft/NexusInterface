// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, FieldArray } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global
import * as RPC from 'scripts/rpc';
import { loadMyAccounts } from 'actions/accountActionCreators';
import Text from 'components/Text';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import FormField from 'components/FormField';
import UIController from 'components/UIController';
import Link from 'components/Link';
import { rpcErrorHandler } from 'utils/form';
import sendIcon from 'images/send.sprite.svg';

// Internal Local
import Recipients from './Recipients';
import {
  getAccountOptions,
  getAddressNameMap,
  getRegisteredFieldNames,
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

const TransactionFee = styled.div(({ theme }) => ({
  marginTop: '1em',
  color: theme.mixer(0.75),
}));

const mapStateToProps = ({
  addressbook: { myAccounts, addressbook },
  settings: { minConfirmations },
  common: { encrypted, loggedIn },
  overview: { paytxfee },
  form,
}) => ({
  minConfirmations,
  encrypted,
  loggedIn,
  paytxfee,
  accountOptions: getAccountOptions(myAccounts),
  addressNameMap: getAddressNameMap(addressbook),
  fieldNames: getRegisteredFieldNames(
    form.sendNXS && form.sendNXS.registeredFields
  ),
});

const mapDispatchToProps = dispatch => ({
  loadMyAccounts: () => dispatch(loadMyAccounts()),
});

@reduxForm({
  form: 'sendNXS',
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
    message: '',
  },
  validate: ({ sendFrom, recipients }) => {
    const errors = {};
    if (!sendFrom) {
      errors.sendFrom = 'No accounts selected';
    }

    if (!recipients || !recipients.length) {
      errors.recipients = { _error: 'There must be at least one recipient' };
    } else {
      const recipientsErrors = [];

      recipients.forEach(({ address, amount }, i) => {
        const recipientErrors = {};
        if (!address) {
          recipientErrors.address = <Text id="Alert.InvalidAddress" />;
        }
        if (!amount || parseFloat(amount) <= 0) {
          recipientErrors.amount = <Text id="Alert.InvalidAmount" />;
        }
        if (Object.keys(recipientErrors).length) {
          recipientsErrors.push(recipientErrors);
        }
      });

      if (recipientsErrors.length) {
        errors.recipients = recipientsErrors;
      }
    }

    return errors;
  },
  asyncBlurFields: ['recipients'],
  asyncValidate: async ({ recipients }) => {
    if (recipients && recipients.length) {
      const recipientsErrors = [];
      await recipients.map(({ address }, i) =>
        (async () => {
          try {
            const result = await RPC.PROMISE('validateaddress', [address]);
            if (!result.isvalid) {
              recipientsErrors[i] = {
                address: <Text id="Alert.InvalidAddress" />,
              };
            }
            if (result.ismine) {
              recipientsErrors[i] = {
                address: <Text id="Alert.registeredToThis" />,
              };
            }
          } catch (err) {
            recipientsErrors[i] = {
              address: <Text id="Alert.InvalidAddress" />,
            };
          }
        })()
      );
      if (recipientsErrors.length) {
        throw { recipients: recipientsErrors };
      }
    }
    return null;
  },
  onSubmit: ({ sendFrom, recipients, message }, dispatch, props) => {
    if (recipients.length === 1) {
      const recipient = recipients[0];
      const params = [
        sendFrom,
        recipient.address,
        parseFloat(recipient.amount),
        parseInt(props.minConfirmations),
      ];
      if (message) params.push(message);
      return RPC.PROMISE('sendfrom', params);
    }
  },
  onSubmitSuccess: (result, dispatch, props) => {
    props.reset();
    props.loadMyAccounts();
    UIController.openSuccessDialog({
      message: <Text id="Alert.Sent" />,
    });
  },
  onSubmitFail: rpcErrorHandler('Error Sending NXS'),
})
@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class SendForm extends Component {
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
      // redux-form also doesn't have the API to get all the field names yet so we have to connect to the store to retrieve it manually
      touch(...fieldNames);
      return;
    }

    if (encrypted && !loggedIn) {
      const modalId = UIController.openErrorDialog({
        message: 'You are not logged in',
        note: (
          <>
            <p>You need to log in to your wallet before sending transactions</p>
            <Link
              to="/Settings/Security"
              onClick={() => {
                UIController.removeModal(modalId);
              }}
            >
              Log in now
            </Link>
          </>
        ),
      });
      return;
    }

    UIController.openConfirmDialog({
      question: <Text id="sendReceive.SendTransaction" />,
      yesCallback: handleSubmit,
    });
  };

  addRecipient = () => {
    this.props.array.push('recipients', {
      address: null,
      amount: '',
      fiatAmount: '',
    });
  };

  render() {
    const { accountOptions, change, paytxfee } = this.props;

    return (
      <SendFormComponent onSubmit={this.confirmSend}>
        <FormField label="Send From">
          <Field
            component={Select.RF}
            name="sendFrom"
            placeholder={<Text id="sendReceive.SelectAnAccount" />}
            options={accountOptions}
          />
        </FormField>

        <FieldArray component={Recipients} name="recipients" change={change} />

        {paytxfee && (
          <TransactionFee>
            <Text id="sendReceive.FEE" />: {paytxfee.toFixed(5)} NXS
          </TransactionFee>
        )}

        <Text id="sendReceive.EnterYourMessage">
          {placeholder => (
            <FormField connectLabel label={<Text id="sendReceive.Message" />}>
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

        <SendFormButtons>
          <Button onClick={this.addRecipient}>
            Send to multiple recipients
          </Button>
          <Button type="submit" skin="primary">
            <Icon icon={sendIcon} spaceRight />
            <Text id="sendReceive.SendNow" />
          </Button>
        </SendFormButtons>
      </SendFormComponent>
    );
  }
}
