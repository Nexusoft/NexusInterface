// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from '@emotion/styled';

// Internal
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import Modal from 'components/Modal';
import { colors } from 'styles';
import trashimg from 'images/trash.svg';

const QueueComponent = styled.div({
  marginTop: 50,
  borderTop: `1px solid ${colors.lightGray}`,
  paddingTop: 20,
});

const QueueHeading = styled.div({
  fontSize: '1.4em',
});

const QueueButtons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
});

const QueueSummary = styled.div({
  textAlign: 'right',
  marginTop: '1em',
});

class QueueBody extends Component {
  static contextType = Modal.Context;

  confirmRemove = key => {
    this.context.openConfirmModal({
      question: (
        <FormattedMessage
          id="sendReceive.RemoveFromQueue"
          defaultMessage="Remove From Queue"
        />
      ),
      yesCallback: () => this.props.removeQueue(key),
    });
  };

  render() {
    return (
      <tbody>
        {Object.keys(this.props.Queue).map(key => (
          <tr key={key}>
            <Tooltip.Trigger
              tooltip={
                <FormattedMessage
                  id="sendReceive.ClickToEdit"
                  defaultMessage="Click To Edit"
                />
              }
            >
              <td className="td" onClick={() => this.props.updateAddress(key)}>
                {key}
              </td>
            </Tooltip.Trigger>
            <td className="td">{this.props.Queue[key].toFixed(5)}</td>
            <td className="td">
              <img
                id="Remove"
                src={trashimg}
                onClick={() => this.confirmRemove(key)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    );
  }
}

export default class Queue extends Component {
  static contextType = Modal.Context;

  addAmount() {
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 0) {
      let sum = Object.values(this.props.Queue).reduce((acc, val) => {
        return acc + val;
      });
      return (
        <QueueSummary>
          <div>
            <FormattedMessage id="sendReceive.Total" defaultMessage="TOTAL" />:{' '}
            {''}
            {sum.toFixed(5)} NXS
          </div>

          {this.props.paytxfee && (
            <div>
              <FormattedMessage id="sendReceive.FEE" defaultMessage="Fee" />:{' '}
              {this.props.paytxfee.toFixed(5)} NXS
            </div>
          )}

          <div>
            <FormattedMessage id="sendReceive.From" defaultMessage="FROM" />:{' '}
            {this.props.accHud(this.props.SelectedAccount)}
          </div>
        </QueueSummary>
      );
    }
  }

  confirmClearQueue = () => {
    this.context.openConfirmModal({
      question: (
        <FormattedMessage
          id="sendReceive.ClearQueue"
          defaultMessage="Clear Queue?"
        />
      ),
      yesCallback: this.props.clearQueue,
    });
  };

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
            this.context.openErrorModal({ message: e });
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
              this.context.openErrorModal({ message: e });
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
              this.context.openErrorModal({ message: e });
            });
        }
      }
    } else {
      this.context.openErrorModal({ message: 'No Account Selected' });
    }
  }

  confirmSendMultiple = () => {
    const { Queue, encrypted, loggedIn } = this.props;

    if (encrypted && !loggedIn) {
      this.context.openErrorModal('Wallet Locked');
      return;
    }
    if (Object.keys(Queue).length === 0) {
      this.context.openErrorModal({
        message: (
          <FormattedMessage
            id="Alert.QueueEmpty"
            defaultMessage="Queue Empty"
          />
        ),
      });
      return;
    }

    this.context.openConfirmModal({
      question: (
        <div>
          <FormattedMessage
            id="sendReceive.SendAllFrom"
            defaultMessage="Send All Transactions From: "
          />
          {this.props.accHud()}
        </div>
      ),
      yesCallback: this.sendMany,
    });
  };

  render() {
    return (
      <QueueComponent>
        <QueueHeading>Transactions Queue</QueueHeading>
        <table className="table">
          <thead>
            <tr className="thead">
              <th>
                <FormattedMessage
                  id="sendReceive.TableAddress"
                  defaultMessage="Address"
                />
              </th>
              <th>
                <FormattedMessage
                  id="sendReceive.TableAmount"
                  defaultMessage="Amount"
                />
              </th>
              <th style={{ whiteSpace: 'nowrap' }}>
                <FormattedMessage
                  id="sendReceive.Remove"
                  defaultMessage="Remove"
                />
              </th>
            </tr>
          </thead>
          <QueueBody {...this.props} />
        </table>

        <QueueButtons>
          <Button type="reset" onClick={this.confirmClearQueue}>
            <FormattedMessage
              id="sendReceive.ClearQueue"
              defaultMessage="Clear Queue"
            />
          </Button>
          <Button skin="primary" onClick={this.confirmSendMultiple}>
            <FormattedMessage
              id="sendReceive.SendAll"
              defaultMessage="SendAll"
            />
          </Button>
        </QueueButtons>

        {this.addAmount()}
      </QueueComponent>
    );
  }
}
