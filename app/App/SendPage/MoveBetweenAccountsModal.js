// External
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { connect } from 'react-redux';

// Internal
import Text from 'components/Text';
import Select from 'components/Select';
import TextField from 'components/TextField';
import FormField from 'components/FormField';
import Button from 'components/Button';
import Modal from 'components/Modal';
import UIController from 'components/UIController';

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

@connect(
  ({
    sendReceive: { MoveFromAccount, MoveToAccount, moveAmount, moveUSDAmount },
    settings: {
      settings: { minimumconfirmations, fiatCurrency },
    },
    overview: { paytxfee },
  }) => ({
    MoveFromAccount,
    MoveToAccount,
    moveAmount,
    moveUSDAmount,
    minimumconfirmations,
    fiatCurrency,
    paytxfee,
  })
)
export default class MoveBetweenAccountsModal extends Component {
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
            parseInt(this.props.minimumconfirmations)
          )
            .then(payload => {
              this.props.getAccountData();
              this.props.CloseMoveModal();
              UIController.showNotification('NXS Moved', 'success');
            })
            .catch(e => {
              if (typeof e === 'object') {
                UIController.openErrorDialog({ message: e.Message });
              } else {
                UIController.openErrorDialog({ message: e });
              }
            });
        } else {
          UIController.openErrorDialog({
            message: <Text id="Alert.InsufficientFunds" />,
          });
        }
      } else {
        UIController.openErrorDialog({
          message: <Text id="Alert.NoSecondAccountChosen" />,
        });
      }
    } else {
      UIController.openErrorDialog({
        message: <Text id="Alert.AccountsAreTheSame" />,
      });
    }
  }

  render() {
    return (
      <Modal style={{ maxWidth: 650 }}>
        <Modal.Header>
          <Text id="sendReceive.MoveNxsBetweenAccount" />
        </Modal.Header>

        <Modal.Body>
          <AccountSelectors>
            <Label>
              <Text id="sendReceive.FromAccount" />
            </Label>
            <Select
              value={this.props.MoveFromAccount}
              onChange={this.props.updateMoveFromAccount}
              options={this.props.accountOptions}
            />

            <Label>
              <Text id="sendReceive.ToAccount" />
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
                label={<Text id="sendReceive.Amount" />}
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
                label={this.props.fiatCurrency}
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
                <Text id="sendReceive.FEE" />: {this.props.paytxfee.toFixed(5)}{' '}
                NXS
              </div>
            )}
          </div>
          <Buttons>
            <Button
              skin="primary"
              onClick={() => this.moveNXSbetweenAccounts()}
            >
              <Text id="sendReceive.MoveNXS" />
            </Button>
          </Buttons>
        </Modal.Body>
      </Modal>
    );
  }
}
