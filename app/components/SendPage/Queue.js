// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-responsive-modal';
import styled from '@emotion/styled';

// Internal
import Button from 'components/common/Button';
import Tooltip from 'components/common/Tooltip';
import { colors } from 'styles';
import trashimg from 'images/trash.svg';

const QueueWrapper = styled.div({
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

export default class Queue extends Component {
  fillQueue() {
    let Keys = Object.keys(this.props.Queue);
    let values = Object.values(this.props.Queue);
    let queueArray = Keys.map((e, i) => {
      let newObj = { key: e, val: values[i] };

      return newObj;
    });

    return queueArray.map((e, i) => {
      return (
        <tr key={i}>
          <Tooltip.Trigger
            tooltip={
              <FormattedMessage
                id="sendReceive.ClickToEdit"
                defaultMessage="Click To Edit"
              />
            }
          >
            <td className="td" onClick={() => this.props.updateAddress(e.key)}>
              {e.key}
            </td>
          </Tooltip.Trigger>
          <td className="td">{e.val.toFixed(5)}</td>
          <td className="td">
            <img
              id="Remove"
              src={trashimg}
              onClick={() => {
                this.props.OpenModal3();
              }}
            />
          </td>
          <Modal
            classNames={{ modal: 'custom-modal2', overlay: 'custom-overlay' }}
            showCloseIcon={false}
            open={this.props.openThirdModal}
            onClose={e => {
              e.preventDefault();
              this.props.CloseModal3();
            }}
            center
          >
            <div>
              {' '}
              <h2>
                <FormattedMessage
                  id="sendReceive.RemoveFromQueue"
                  defaultMessage="Remove From Queue"
                />
              </h2>
              <div id="ok-button">
                <FormattedMessage id="sendReceive.Yes">
                  {yes => (
                    <input
                      value={yes}
                      type="button"
                      className="button primary"
                      onClick={() => {
                        this.props.removeQueue(e.key);
                        this.props.CloseModal3();
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div id="no-button">
                <FormattedMessage id="sendReceive.No" defaultMessage="No">
                  {no => (
                    <input
                      value={no}
                      type="button"
                      className="button"
                      onClick={() => {
                        this.props.CloseModal3();
                      }}
                    />
                  )}
                </FormattedMessage>
              </div>
            </div>
          </Modal>
        </tr>
      );
    });
  }

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
              <FormattedMessage id="sendReceive.FEE" defaultMessage="FEE" />:{' '}
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

  render() {
    return (
      <QueueWrapper>
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
          <tbody>{this.fillQueue()}</tbody>
        </table>

        <QueueButtons>
          <Button
            type="reset"
            onClick={() => {
              this.props.OpenModal2('Clear Queue?');
            }}
          >
            <FormattedMessage
              id="sendReceive.ClearQueue"
              defaultMessage="Clear Queue"
            />
          </Button>
          <Button
            skin="primary"
            onClick={() => {
              console.log(this.props.encrypted, this.props.loggedIn);
              if (
                this.props.encrypted === false ||
                this.props.loggedIn === true
              ) {
                if (Object.keys(this.props.Queue).length > 0) {
                  this.props.OpenModal2('Send Multiple?');
                } else {
                  this.props.OpenErrorModal('Empty Queue!');
                }
              } else {
                this.props.OpenErrorModal('Wallet Locked');
              }
            }}
          >
            <FormattedMessage
              id="sendReceive.SendAll"
              defaultMessage="SendAll"
            />
          </Button>
        </QueueButtons>

        {this.addAmount()}
      </QueueWrapper>
    );
  }
}
