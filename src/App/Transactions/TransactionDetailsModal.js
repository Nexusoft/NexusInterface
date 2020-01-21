import React from 'react';
import { connect } from 'react-redux';

import Modal from 'components/Modal';
import InfoField from 'components/InfoField';
import WaitingMessage from 'components/WaitingMessage';
import { formatDateTime } from 'lib/intl';
import { isPending, fetchTransaction } from 'lib/transactions';

import { categoryText } from './utils';

__ = __context('Transactions.TransactionDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

@connect(
  ({ settings: { minConfirmations }, transactions: { map } }, props) => ({
    minConfirmations,
    transaction: map[props.txid],
  })
)
export default class TransactionDetailsModal extends React.Component {
  constructor(props) {
    super(props);
    fetchTransaction(this.props.txid);
  }

  render() {
    const { transaction, minConfirmations } = this.props;

    return (
      <Modal>
        <Modal.Header>{__('Transactions Details')}</Modal.Header>
        <Modal.Body>
          {transaction ? (
            <>
              <InfoField label={__('Time')}>
                {formatDateTime(transaction.time * 1000, timeFormatOptions)}
              </InfoField>
              <InfoField label={__('Category')}>
                {categoryText(transaction.category)}
              </InfoField>
              <InfoField label={__('Amount')}>{transaction.amount}</InfoField>
              {!!transaction.fee &&
                ['debit', 'credit', 'receive', 'send'].includes(
                  transaction.category
                ) && <InfoField label={__('Fee')}>{transaction.fee}</InfoField>}
              <InfoField label={__('Account')}>{transaction.account}</InfoField>
              <InfoField label={__('Address')}>
                <span className="monospace">{transaction.address}</span>
              </InfoField>
              <InfoField label={__('Confirmations')}>
                {transaction.confirmations}
                {isPending(transaction, minConfirmations) &&
                  ` (${__('Pending')})`}
              </InfoField>
              <InfoField label={__('Transaction ID')}>
                <span className="monospace">{transaction.txid}</span>
              </InfoField>
              <InfoField label={__('Block hash')}>
                <span className="monospace">{transaction.blockhash}</span>
              </InfoField>
            </>
          ) : (
            <WaitingMessage>
              {__('Loading transaction details...')}
            </WaitingMessage>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}
