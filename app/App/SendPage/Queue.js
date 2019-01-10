// External
import React, { Component } from 'react';
import Text from 'components/Text';
import styled from '@emotion/styled';

// Internal
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import UIController from 'components/UIController';
import trashimg from 'images/trash.svg';

const QueueComponent = styled.div(({ theme }) => ({
  marginTop: 50,
  paddingTop: 20,
  borderTop: `1px solid ${theme.lightGray}`,
}));

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
  confirmRemove = key => {
    UIController.openConfirmDialog({
      question: <Text id="sendReceive.RemoveFromQueue" />,
      yesCallback: () => this.props.removeQueue(key),
    });
  };

  render() {
    return (
      <tbody>
        {Object.keys(this.props.Queue).map(key => (
          <tr key={key}>
            <Tooltip.Trigger tooltip={<Text id="sendReceive.ClickToEdit" />}>
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
  addAmount() {
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 0) {
      let sum = Object.values(this.props.Queue).reduce((acc, val) => {
        return acc + val;
      });
      return (
        <QueueSummary>
          <div>
            <Text id="sendReceive.Total" />: {''}
            {sum.toFixed(5)} NXS
          </div>

          {this.props.paytxfee && (
            <div>
              <Text id="sendReceive.FEE" />: {this.props.paytxfee.toFixed(5)}{' '}
              NXS
            </div>
          )}

          <div>
            <Text id="sendReceive.From" />:{' '}
            {this.props.accHud(this.props.SelectedAccount)}
          </div>
        </QueueSummary>
      );
    }
  }

  confirmClearQueue = () => {
    UIController.openConfirmDialog({
      question: <Text id="sendReceive.ClearQueue" />,
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
            UIController.showNotification(<Text id="Alert.Sent" />, 'success');
            this.props.getAccountData();
            this.props.busy();
            this.props.clearForm();
            this.props.clearQueue();
          })
          .catch(e => {
            this.props.busy();
            UIController.openErrorDialog({ message: e });
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
              UIController.showNotification(
                <Text id="Alert.Sent" />,
                'success'
              );
              this.props.clearForm();
              this.props.clearQueue();
              this.props.busy();
            })
            .catch(e => {
              console.log(e);
              this.props.busy();
              UIController.openErrorDialog({ message: e });
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
              UIController.showNotification(
                <Text id="Alert.Sent" />,
                'success'
              );
              this.props.clearForm();
              this.props.clearQueue();
              this.props.busy();
            })
            .catch(e => {
              console.log(e);
              this.props.busy();
              UIController.openErrorDialog({ message: e });
            });
        }
      }
    } else {
      UIController.openErrorDialog({ message: 'No Account Selected' });
    }
  }

  confirmSendMultiple = () => {
    const { Queue, encrypted, loggedIn } = this.props;

    if (encrypted && !loggedIn) {
      UIController.openErrorDialog('Wallet Locked');
      return;
    }
    if (Object.keys(Queue).length === 0) {
      UIController.openErrorDialog({
        message: <Text id="Alert.QueueEmpty" />,
      });
      return;
    }

    UIController.openConfirmDialog({
      question: (
        <div>
          <Text id="sendReceive.SendAllFrom" />
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
                <Text id="sendReceive.TableAddress" />
              </th>
              <th>
                <Text id="sendReceive.TableAmount" />
              </th>
              <th style={{ whiteSpace: 'nowrap' }}>
                <Text id="sendReceive.Remove" />
              </th>
            </tr>
          </thead>
          <QueueBody {...this.props} />
        </table>

        <QueueButtons>
          <Button type="reset" onClick={this.confirmClearQueue}>
            <Text id="sendReceive.ClearQueue" />
          </Button>
          <Button skin="primary" onClick={this.confirmSendMultiple}>
            <Text id="sendReceive.SendAll" />
          </Button>
        </QueueButtons>

        {this.addAmount()}
      </QueueComponent>
    );
  }
}
