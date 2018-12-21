// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-responsive-modal';

// Internal
import ComboBox from 'components/common/ComboBox';

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
            <div>
              <div className="moveSelectors">
                <span>
                  {' '}
                  <FormattedMessage
                    id="sendReceive.FromAccount"
                    defaultMessage="From Account"
                  />
                  :
                </span>
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

                <span>
                  {' '}
                  <FormattedMessage
                    id="sendReceive.ToAccount"
                    defaultMessage="To Account"
                  />
                  :
                </span>
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
              </div>
            </div>
            <div>
              <div className="convertor">
                <label>
                  <FormattedMessage
                    id="sendReceive.Amount"
                    defaultMessage="Nexus Amount"
                  />
                </label>
                <label className="UsdConvertorLabel">
                  {this.props.settings.fiatCurrency}
                </label>
              </div>
              <div className="convertor">
                <input
                  className="input"
                  type="text"
                  placeholder="0.00000"
                  value={this.props.moveAmount}
                  onChange={e => this.moveAmmountConverter(e, true)}
                  required
                />{' '}
                <label>=</label>
                <input
                  className="input"
                  type="text"
                  placeholder="0.00"
                  value={this.props.moveUSDAmount}
                  onChange={e => {
                    this.moveAmmountConverter(e);
                  }}
                  required
                />
              </div>
              {this.props.paytxfee && (
                <div>
                  <FormattedMessage id="sendReceive.FEE" defaultMessage="FEE" />
                  : {this.props.paytxfee.toFixed(5)} NXS
                </div>
              )}
            </div>
          </div>
          <div>
            <button
              className="button primary"
              style={{ marginLeft: '0px' }}
              onClick={() => this.moveNXSbetweenAccounts()}
            >
              <FormattedMessage
                id="sendReceive.MoveNXS"
                defaultMessage="Move NXS"
              />
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}
