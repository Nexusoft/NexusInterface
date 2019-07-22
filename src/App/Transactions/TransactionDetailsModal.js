// External
import React, { Component } from 'react';
import Text from 'components/Text';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import rpc from 'lib/rpc';

/**
 * Transaction More Detail Modal
 *
 * @class TransactionDetailsModal
 * @extends {Component}
 */
class TransactionDetailsModal extends Component {
  /**
   *Creates an instance of TransactionDetailsModal.
   * @param {*} props
   * @memberof TransactionDetailsModal
   */
  constructor(props) {
    super(props);
    this.loadData(props);
  }

  state = {
    highlightedTxFee: 'Loading',
    highlightedBlockHash: 'Loading',
    highlightedBlockNum: 'Loading',
  };

  /**
   * Load Data
   *
   * @param {*} { walletItems, hoveringID }
   * @memberof TransactionDetailsModal
   */
  async loadData({ walletItemsMap, hoveringID }) {
    if (
      walletItemsMap &&
      walletItemsMap.get(hoveringID) &&
      walletItemsMap.get(hoveringID).confirmations
    ) {
      const tx = await rpc('gettransaction', [
        walletItemsMap.get(hoveringID).txid,
      ]);
      this.setState({
        highlightedBlockHash: tx.blockhash,
        highlightedTxFee: tx.fee,
      });

      const block = await rpc('getblock', [tx.blockhash]);
      this.setState({ highlightedBlockNum: block.height });
    }
  }

  /**
   * React Render
   *
   * @returns
   * @memberof TransactionDetailsModal
   */
  render() {
    const { hoveringID, walletItemsMap, settings } = this.props;
    const {
      highlightedBlockNum,
      highlightedBlockHash,
      highlightedTxFee,
    } = this.state;

    if (
      hoveringID != 999999999999 &&
      !!walletItemsMap &&
      walletItemsMap.get(hoveringID)
    ) {
      const tx = walletItemsMap.get(hoveringID);
      // console.log(tx.category);
      return (
        <Modal>
          <Modal.Header>Transaction Details</Modal.Header>
          <Modal.Body>
            {tx.confirmations <= settings.minConfirmations && (
              <div>
                <a>
                  _`PENDING TRANSACTION`
                </a>
              </div>
            )}

            <div key="modal_amount" className="detailCat">
              _`Amount: `
              <span className="TXdetails">{tx.amount}</span>
            </div>

            {(tx.category === 'debit' || tx.category === 'send') && (
              <div key="modal_fee" className="detailCat">
                _`Fee`:
                <span className="TXdetails">{highlightedTxFee}</span>
              </div>
            )}

            <div key="modal_time" className="detailCat">
              _`Time: `
              <span className="TXdetails">
                {new Date(tx.time * 1000).toLocaleString(settings.locale)}
              </span>
            </div>

            <div key="modal_Account" className="detailCat">
              _`Account`:
              <span className="TXdetails">{tx.account}</span>
            </div>

            <div key="modal_Confirms" className="detailCat">
              _`Confirmations`:
              <span className="TXdetails">{tx.confirmations}</span>
            </div>

            <div key="modal_TXID">
              _`TX Number`:
              <div className="blockHash" style={{ wordWrap: 'break-word' }}>
                <span>{tx.txid}</span>
              </div>
            </div>

            <div key="modal_BlockNumber" className="detailCat">
              _`Block Number`:
              <span className="TXdetails">{highlightedBlockNum}</span>
            </div>

            <div key="modal_BlockHash">
              _`Block Hash`:
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
