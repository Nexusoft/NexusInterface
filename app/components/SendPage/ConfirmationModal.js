// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-responsive-modal';

export default class ConfirmationModal extends Component {
  sendOne() {
    console.log('Send');
    this.props.busy();
    if (this.props.SelectedAccount !== '') {
      if (this.props.Address !== '' && this.props.Amount > 0) {
        RPC.PROMISE('validateaddress', [this.props.Address])
          .then(payload => {
            if (payload.isvalid) {
              if (!payload.ismine) {
                if (this.props.Message) {
                  RPC.PROMISE('sendfrom', [
                    this.props.SelectedAccount,
                    this.props.Address,
                    parseFloat(this.props.Amount),
                    parseInt(this.props.settings.minimumconfirmations),
                    this.props.Message,
                  ])
                    .then(payload => {
                      this.props.getAccountData();
                      this.props.OpenModal('send');
                      this.props.clearForm();
                      this.props.busy();
                    })
                    .catch(e => {
                      console.log(e);
                      this.props.busy();
                      this.props.OpenErrorModal(e);
                    });
                } else {
                  RPC.PROMISE('sendfrom', [
                    this.props.SelectedAccount,
                    this.props.Address,
                    parseFloat(this.props.Amount),
                    parseInt(this.props.settings.minimumconfirmations),
                  ])
                    .then(payoad => {
                      this.props.getAccountData();
                      this.props.OpenModal('send');
                      this.props.clearForm();
                      this.props.busy();
                    })
                    .catch(e => {
                      console.log(e);
                      this.props.busy();
                      this.props.OpenErrorModal(e);
                    });
                }
              } else {
                this.props.busy();
                this.props.OpenErrorModal(
                  'This is an address registered to this wallet'
                );
              }
            } else {
              this.props.busy();
              this.props.OpenErrorModal('Invalid Address');
            }
          })
          .catch(e => {
            this.props.busy();
            this.props.OpenErrorModal('Invalid Address');
          });
      } else {
        this.props.busy();
      }
    } else {
      this.props.OpenErrorModal('No Account Selected');
    }
  }

  sendMany() {
    this.props.busy();
    let keyCheck = Object.keys(this.props.Queue);
    if (this.props.SelectedAccount !== '') {
      if (keyCheck.length > 1) {
        RPC.PROMISE(
          'sendmany',
          [this.props.SelectedAccount, this.props.Queue],
          parseInt(this.props.settings.minimumconfirmations),
          this.props.Message
        )
          .then(payoad => {
            this.props.OpenModal('send');
            this.props.getAccountData();
            this.props.busy();
            this.props.clearForm();
            this.props.clearQueue();
          })
          .catch(e => {
            this.props.busy();
            this.props.OpenErrorModal(e);
          });
      } else if (Object.values(this.props.Queue)[0] > 0) {
        if (this.props.Message) {
          RPC.PROMISE('sendfrom', [
            this.props.SelectedAccount,
            keyCheck[0],
            parseFloat(Object.values(this.props.Queue)[0]),
            parseInt(this.props.settings.minimumconfirmations),
            this.props.Message,
          ])
            .then(payload => {
              this.props.getAccountData();
              this.props.OpenModal('send');
              this.props.clearForm();
              this.props.clearQueue();
              this.props.busy();
            })
            .catch(e => {
              console.log(e);
              this.props.busy();
              this.props.OpenErrorModal(e);
            });
        } else {
          RPC.PROMISE('sendfrom', [
            this.props.SelectedAccount,
            keyCheck[0],
            parseFloat(Object.values(this.props.Queue)[0]),
            parseInt(this.props.settings.minimumconfirmations),
          ])
            .then(payoad => {
              this.props.getAccountData();
              this.props.OpenModal('send');
              this.props.clearForm();
              this.props.clearQueue();
              this.props.busy();
            })
            .catch(e => {
              console.log(e);
              this.props.busy();
              this.props.OpenErrorModal(e);
            });
        }
      }
    } else {
      this.props.OpenErrorModal('No Account Selected');
    }
  }

  modalContent() {
    switch (this.props.SendReceiveModalType) {
      case 'send transaction?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.SendTransaction"
                defaultMessage="Send Transaction"
              />
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {corn => (
                  <input
                    value={corn}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.sendOne();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;
      case 'Clear Queue?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.ClearQueue"
                defaultMessage="Clear Queue?"
              />
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {yes => (
                  <input
                    value={yes}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.props.clearQueue();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;
      case 'Send Multiple?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.SendAllFrom"
                defaultMessage="Send All Transactions From: "
              >
                {/* Send All Transactions (Total: {this.areYouSure()}) From */}
              </FormattedMessage>

              {this.props.accHud()}
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {yes => (
                  <input
                    value={yes}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.sendMany();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;
      case 'Edit Entry?':
        return (
          <div>
            <h2>
              <FormattedMessage
                id="sendReceive.EditEntry"
                defaultMessage="Edit Entry"
              />
            </h2>
            <div id="ok-button">
              <FormattedMessage id="sendReceive.Yes" defaultMessage="Yes">
                {Yes => (
                  <input
                    value={Yes}
                    type="button"
                    className="button primary"
                    onClick={() => {
                      this.props.validateAddToQueue();
                      this.props.CloseModal2();
                    }}
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        );
        break;

      default:
        'Error';
        break;
    }
  }

  render() {
    return (
      <Modal
        center
        classNames={{ modal: 'custom-modal2', overlay: 'custom-overlay' }}
        showCloseIcon={false}
        open={this.props.openSecondModal}
        onClose={e => {
          e.preventDefault();
          this.props.CloseModal2();
        }}
      >
        {this.modalContent()}
        <div id="no-button">
          <FormattedMessage id="sendReceive.Cancel" defaultMessage="Cancel">
            {cancel => (
              <input
                value={cancel}
                className="button"
                type="button"
                onClick={() => {
                  this.props.CloseModal2();
                }}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}
