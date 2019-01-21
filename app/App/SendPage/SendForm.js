// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal Global Dependencies
import * as RPC from 'scripts/rpc';
import { loadMyAccounts } from 'actions/accountActionCreators';
import Text from 'components/Text';
import Icon from 'components/Icon';
import Button from 'components/Button';
import TextField from 'components/TextField';
import Select from 'components/Select';
import FormField from 'components/FormField';
import InputGroup from 'components/InputGroup';
import UIController from 'components/UIController';
import Link from 'components/Link';
import { rpcErrorHandler } from 'utils/form';

// Internal Local Dependencies
import LookupAddressModal from './LookupAddressModal';
import { getAccountOptions, getNxsFiatPrice } from './selectors';

// Resources
import sendIcon from 'images/send.sprite.svg';
import addressBookIcon from 'images/address-book.sprite.svg';

const formName = 'sendNXS';
const floatRegex = /^[0-9]+(.[0-9]*)?$/;

const SendFormComponent = styled.form({
  maxWidth: 620,
  margin: '0 auto',
});

const SendAmount = styled.div({
  display: 'flex',
});

const SendAmountField = styled.div({
  flex: 1,
});

const SendAmountEqual = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '.1em .6em',
  fontSize: '1.2em',
});

const SendFormButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '2em',
});

const mapStateToProps = ({
  addressbook: { myAccounts },
  settings: { fiatCurrency, minConfirmations },
  common: { rawNXSvalues, encrypted, loggedIn },
}) => {
  return {
    accountOptions: getAccountOptions(myAccounts),
    fiatCurrency: fiatCurrency,
    minConfirmations: minConfirmations,
    encrypted: encrypted,
    loggedIn: loggedIn,
    nxsFiatPrice: getNxsFiatPrice(rawNXSvalues, fiatCurrency),
  };
};

const mapDispatchToProps = dispatch => ({
  loadMyAccounts: () => dispatch(loadMyAccounts()),
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
@reduxForm({
  form: formName,
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
        throw { sendTo: err };
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
  onSubmitFail: rpcErrorHandler('Error Saving Settings'),
})
export default class SendForm extends Component {
  nxsToFiat = (e, value) => {
    if (floatRegex.test(value)) {
      const nxs = parseFloat(value);
      const { nxsFiatPrice } = this.props;
      if (nxsFiatPrice) {
        const fiat = nxs * nxsFiatPrice;
        this.props.change('fiatAmount', fiat.toFixed(2));
      }
    }
  };

  fiatToNxs = (e, value) => {
    if (floatRegex.test(value)) {
      const fiat = parseFloat(value);
      const { nxsFiatPrice } = this.props;
      if (nxsFiatPrice) {
        const nxs = fiat / nxsFiatPrice;
        this.props.change('amount', nxs.toFixed(5));
      }
    }
  };

  updateRecipient = address => {
    this.props.change('sendTo', address);
  };

  lookupAddress = () => {
    UIController.openModal(LookupAddressModal, {
      updateRecipient: this.updateRecipient,
    });
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
    const { accountOptions, fiatCurrency } = this.props;
    return (
      <SendFormComponent onSubmit={this.confirmSend}>
        <FormField label="Send From">
          <Field
            component={Select.RF}
            name="sendFrom"
            options={accountOptions}
          />
        </FormField>

        <FormField label="Send To">
          <InputGroup>
            <Field
              component={TextField.RF}
              name="sendTo"
              placeholder="Recipient Address"
            />
            <Button fitHeight className="relative" onClick={this.lookupAddress}>
              <Icon spaceRight icon={addressBookIcon} />
              <Text id="sendReceive.Contacts" />
            </Button>
          </InputGroup>
        </FormField>

        <SendAmount>
          <SendAmountField>
            <FormField connectLabel label={<Text id="sendReceive.Amount" />}>
              <Field
                component={TextField.RF}
                name="amount"
                placeholder="0.00000"
                onChange={this.nxsToFiat}
              />
            </FormField>
          </SendAmountField>

          <SendAmountEqual>=</SendAmountEqual>

          <SendAmountField>
            <FormField connectLabel label={fiatCurrency}>
              <Field
                component={TextField.RF}
                name="fiatAmount"
                placeholder="0.00"
                onChange={this.fiatToNxs}
              />
            </FormField>
          </SendAmountField>
        </SendAmount>

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
