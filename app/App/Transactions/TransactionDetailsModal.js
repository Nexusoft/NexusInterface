// External
import React, { Component } from 'react';
import Text from 'components/Text';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import * as RPC from 'scripts/rpc';

class TransactionDetailsModal extends Component {
  constructor(props) {
    super(props);
    this.loadData(props);
  }

  state = {
    highlightedBlockHash: 'Loading',
    highlightedBlockNum: 'Loading',
  };

  async loadData({ walletItems, hoveringID }) {
    if (
      walletItems &&
      walletItems[hoveringID] &&
      walletItems[hoveringID].confirmations
    ) {
      const tx = await RPC.PROMISE('gettransaction', [
        walletItems[hoveringID].txid,
      ]);
      this.setState({ highlightedBlockHash: tx.blockhash });

      const block = await RPC.PROMISE('getblock', [tx.blockhash]);
      this.setState({ highlightedBlockNum: block.height });
    }
  }

  render() {
    const { hoveringID, walletItems, settings } = this.props;
    const { highlightedBlockNum, highlightedBlockHash } = this.state;

    if (
      hoveringID != 999999999999 &&
      !!walletItems &&
      walletItems[hoveringID]
    ) {
      const tx = walletItems[hoveringID];
      return (
        <Modal>
          <Modal.Header>Transaction Details</Modal.Header>
          <Modal.Body>
            {tx.confirmations <= settings.minConfirmations && (
              <div>
                <a>
                  <Text id="transactions.PendingTransaction" />
                </a>
              </div>
            )}

            <div key="modal_amount" className="detailCat">
              <Text id="transactions.AMOUNT" />
              <span className="TXdetails">{tx.amount}</span>
            </div>

            {tx.category === 'debit' && (
              <div key="modal_fee" className="detailCat">
                <Text id="transactions.fee" />:
                <span className="TXdetails">{+tx.fee}</span>
              </div>
            )}

            <div key="modal_time" className="detailCat">
              <Text id="transactions.TIME" />
              <span className="TXdetails">
                {new Date(tx.time * 1000).toLocaleString(settings.locale)}
              </span>
            </div>

            <div key="modal_Account" className="detailCat">
              <Text id="AddressBook.Account" />:
              <span className="TXdetails">{tx.account}</span>
            </div>

            <div key="modal_Confirms" className="detailCat">
              <Text id="transactions.confirmations" />:
              <span className="TXdetails">{tx.confirmations}</span>
            </div>

            <div key="modal_TXID">
              <Text id="transactions.TX" />:
              <div className="blockHash" style={{ wordWrap: 'break-word' }}>
                <span>{tx.txid}</span>
              </div>
            </div>

            <div key="modal_BlockNumber" className="detailCat">
              <Text id="transactions.blocknumber" />:
              <span className="TXdetails">{highlightedBlockNum}</span>
            </div>

            <div key="modal_BlockHash">
              <Text id="transactions.blockhash" />:
              <div className="blockHash" style={{ wordWrap: 'break-word' }}>
                <span>{highlightedBlockHash}</span>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      );
    }
    return null;
  }
}

export default TransactionDetailsModal;
