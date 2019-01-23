// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
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
import RecipientField from './RecipientField';
import AmountField from './AmountField';
import { getAccountOptions, getAddressNameMap } from './selectors';

const SendFormComponent = styled.form({
  maxWidth: 620,
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
}) => ({
  minConfirmations,
  encrypted,
  loggedIn,
  paytxfee,
  accountOptions: getAccountOptions(myAccounts),
  addressNameMap: getAddressNameMap(addressbook),
});

const mapDispatchToProps = dispatch => ({
  loadMyAccounts: () => dispatch(loadMyAccounts()),
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
@reduxForm({
  form: 'sendNXS',
  initialValues: {
    sendFrom: null,
    sendTo: null,
    amount: '',
    fiatAmount: '',
    message: '',
  },
  validate: ({ sendFrom, sendTo, amount }) => {
    const errors = {};
    if (!sendFrom) {
      errors.sendFrom = 'No accounts selected';
    }
    if (!sendTo) {
      errors.sendTo = <Text id="Alert.InvalidAddress" />;
    }
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = <Text id="Alert.InvalidAmount" />;
    }
    return errors;
  },
  asyncBlurFields: ['sendTo'],
  asyncValidate: async ({ sendTo }) => {
    console.log('validate', sendTo);
    if (sendTo) {
      try {
        const result = await RPC.PROMISE('validateaddress', [sendTo]);
        if (!result.isvalid) {
          throw { sendTo: <Text id="Alert.InvalidAddress" /> };
        }
        if (result.ismine) {
          throw { sendTo: <Text id="Alert.registeredToThis" /> };
        }
      } catch (err) {
        throw { sendTo: <Text id="Alert.InvalidAddress" /> };
      }
    }
    return null;
  },
  onSubmit: ({ sendFrom, sendTo, amount, message }, dispatch, props) => {
    const params = [
      sendFrom,
      sendTo,
      parseFloat(amount),
      parseInt(props.minConfirmations),
    ];
    if (message) params.push(message);
    return RPC.PROMISE('sendfrom', params);
  },
  onSubmitSuccess: (result, dispatch, props) => {
    UIController.openSuccessDialog({
      message: <Text id="Alert.Sent" />,
    });
    props.reset();
    props.loadMyAccounts();
  },
  onSubmitFail: rpcErrorHandler('Error Sending NXS'),
})
export default class SendForm extends Component {
  updateRecipient = address => {
    this.props.change('sendTo', address);
  };

  confirmSend = e => {
    e.preventDefault();
    const { handleSubmit, invalid, encrypted, loggedIn, touch } = this.props;

    if (invalid) {
      // Mark the form touched so that the validation errors will be shown
      touch('sendFrom', 'sendTo', 'amount', 'fiatAmount', 'message');
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

        <Field
          name="sendTo"
          component={RecipientField}
          updateRecipient={this.updateRecipient}
        />

        <AmountField change={change} />

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
          <div />
          <Button type="submit" skin="primary">
            <Icon icon={sendIcon} spaceRight />
            <Text id="sendReceive.SendNow" />
          </Button>
        </SendFormButtons>
      </SendFormComponent>
    );
  }
}
