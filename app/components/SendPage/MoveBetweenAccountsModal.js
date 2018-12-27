// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from '@emotion/styled';

// Internal
import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Modal from 'components/Modal';

const AccountSelectors = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateRows: 'auto auto',
  gridGap: '1em .5em',
  alignItems: 'center',
});

const Label = styled.label({
  paddingRight: '2em',
});

const Equal = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  padding: '.1em .6em',
  fontSize: '1.2em',
});

const Buttons = styled.div({
  marginTop: '1em',
  display: 'flex',
  justifyContent: 'flex-end',
});

export default class MoveBetweenAccountsModal extends Component {
  static contextType = Modal.Context;

  moveAmmountConverter(e, isNxs) {
    if (/^[0-9.]+$/.test(e.target.value) | (e.target.value === '')) {
      if (isNxs) {
        let Usd = e.target.value * this.props.calculateUSDvalue();
        this.props.updateMoveAmount(e.target.value, Usd.toFixed(2));
      } else {
        let NxsValue = e.target.value / this.props.calculateUSDvalue();
        this.props.updateMoveAmount(NxsValue.toFixed(5), e.target.value);
      }
    } else {
      return null;
    }
  }

  moveNXSbetweenAccounts() {
    let from = this.props.AccountChanger.filter(acct => {
      if (acct.name === this.props.MoveFromAccount) {
        return acct;
      }
    });
    if (this.props.MoveFromAccount !== this.props.MoveToAccount) {
      if (this.props.MoveFromAccount !== '') {
        if (parseFloat(from[0].val) > parseFloat(this.props.moveAmount)) {
          RPC.PROMISE(
            'move',
            [
              this.props.MoveFromAccount,
              this.props.MoveToAccount,
              parseFloat(this.props.moveAmount),
            ],
            parseInt(this.props.settings.minimumconfirmations),
            this.props.Message
          )
            .then(payload => {
              this.props.getAccountData();
              this.props.CloseMoveModal();
              this.props.OpenModal('NXS Moved');
            })
            .catch(e => {
              if (typeof e === 'object') {
                this.context.openErrorModal({ message: e.Message });
              } else {
                this.context.openErrorModal({ message: e });
              }
            });
        } else {
          this.context.openErrorModal({
            message: (
              <FormattedMessage
                id="Alert.InsufficientFunds"
                defaultMessage="Insufficient Funds"
              />
            ),
          });
        }
      } else {
        this.context.openErrorModal({
          message: (
            <FormattedMessage
              id="Alert.NoSecondAccountChosen"
              defaultMessage="No second account chosen"
            />
          ),
        });
      }
    } else {
      this.context.openErrorModal({
        message: (
          <FormattedMessage
            id="Alert.AccountsAreTheSame"
            defaultMessage="Accounts are the same"
          />
        ),
      });
    }
  }

  render() {
    return (
      <Modal style={{ maxWidth: 650 }}>
        <Modal.Header>Move NXS between accounts</Modal.Header>

        <Modal.Body>
          <AccountSelectors>
            <Label>
              <FormattedMessage
                id="sendReceive.FromAccount"
                defaultMessage="From Account"
              />
            </Label>
            <Select
              value={this.props.MoveFromAccount}
              onChange={this.props.updateMoveFromAccount}
              options={this.props.accountOptions}
            />

            <Label>
              <FormattedMessage
                id="sendReceive.ToAccount"
                defaultMessage="To Account"
              />
            </Label>
            <Select
              value={this.props.MoveToAccount}
              onChange={this.props.updateMoveToAccount}
              options={this.props.accountOptions}
            />
          </AccountSelectors>
          <div>
            <div className="flex">
              <FormField
                connectLabel
                style={{ flex: 1 }}
                label={
                  <FormattedMessage
                    id="sendReceive.Amount"
                    defaultMessage="Nexus Amount"
                  />
                }
              >
                <TextField
                  placeholder="0.00000"
                  value={this.props.moveAmount}
                  onChange={e => this.moveAmmountConverter(e, true)}
                  required
                />
              </FormField>
              <Equal>=</Equal>
              <FormField
                connectLabel
                style={{ flex: 1 }}
                label={this.props.settings.fiatCurrency}
              >
                <TextField
                  placeholder="0.00"
                  value={this.props.moveUSDAmount}
                  onChange={e => {
                    this.moveAmmountConverter(e);
                  }}
                  required
                />
              </FormField>
            </div>
            {this.props.paytxfee && (
              <div style={{ marginTop: '1em' }}>
                <FormattedMessage id="sendReceive.FEE" defaultMessage="Fee" />:{' '}
                {this.props.paytxfee.toFixed(5)} NXS
              </div>
            )}
          </div>
          <Buttons>
            <Button
              skin="primary"
              onClick={() => this.moveNXSbetweenAccounts()}
            >
              <FormattedMessage
                id="sendReceive.MoveNXS"
                defaultMessage="Move NXS"
              />
            </Button>
          </Buttons>
        </Modal.Body>
      </Modal>
    );
  }
}
