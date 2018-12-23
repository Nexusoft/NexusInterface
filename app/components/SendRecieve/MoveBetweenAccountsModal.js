// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-responsive-modal';
import styled from '@emotion/styled';

// Internal
import ComboBox from 'components/common/ComboBox';
import TextField from 'components/common/TextField';
import FormField from 'components/common/FormField';
import Button from 'components/common/Button';

const AccountSelectors = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  gridTemplateRows: 'auto auto',
  gridGap: '1em .5em',
  alignItems: 'center',
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
                this.props.OpenErrorModal(e.Message);
              } else {
                this.props.OpenErrorModal(e);
              }
            });
        } else {
          this.props.OpenErrorModal('Insufficient funds');
        }
      } else {
        this.props.OpenErrorModal('No second account chosen');
      }
    } else {
      this.props.OpenErrorModal('Accounts are the same');
    }
  }

  render() {
    return (
      <Modal
        center
        classNames={{ modal: 'modal' }}
        showCloseIcon={true}
        open={this.props.moveModal}
        onClose={e => {
          e.preventDefault();
          this.props.CloseMoveModal();
        }}
      >
        <div className="MoveModal">
          <div>
            <AccountSelectors>
              <label>
                <FormattedMessage
                  id="sendReceive.FromAccount"
                  defaultMessage="From Account"
                />
              </label>
              <ComboBox
                value={this.props.MoveFromAccount}
                onChange={this.props.updateMoveFromAccount}
                options={[
                  {
                    value: '',
                    display: (
                      <FormattedMessage
                        id="sendReceive.SelectAnAccount"
                        defaultMessage="Select an Account"
                      />
                    ),
                  },
                  ...this.props.accountChanger(),
                ]}
              />

              <label>
                <FormattedMessage
                  id="sendReceive.ToAccount"
                  defaultMessage="To Account"
                />
              </label>
              <ComboBox
                value={this.props.MoveToAccount}
                onChange={this.props.updateMoveToAccount}
                options={[
                  {
                    value: '',
                    display: (
                      <FormattedMessage
                        id="sendReceive.SelectAnAccount"
                        defaultMessage="Select an Account"
                      />
                    ),
                  },
                  ...this.props.accountChanger(),
                ]}
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
                  <FormattedMessage id="sendReceive.FEE" defaultMessage="FEE" />
                  : {this.props.paytxfee.toFixed(5)} NXS
                </div>
              )}
            </div>
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
        </div>
      </Modal>
    );
  }
}
