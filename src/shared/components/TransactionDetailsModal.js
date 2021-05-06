import { Component } from 'react';
import { connect } from 'react-redux';

import ControlledModal from 'components/ControlledModal';
import InfoField from 'components/InfoField';
import WaitingMessage from 'components/WaitingMessage';
import { formatDateTime } from 'lib/intl';
import { fetchTransaction } from 'lib/tritiumTransactions';

__ = __context('TransactionDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

@connect(({ user: { transactions: { map } } }, props) => ({
  transaction: map && map[props.txid],
}))
class TransactionDetailsModal extends Component {
  constructor(props) {
    super(props);
    fetchTransaction(this.props.txid);
  }

  render() {
    const { transaction } = this.props;

    return (
      <ControlledModal>
        <ControlledModal.Header>
          {__('Transaction Details')}
        </ControlledModal.Header>
        <ControlledModal.Body>
          {transaction ? (
            <>
              <InfoField label={__('Time')}>
                {formatDateTime(
                  transaction.timestamp * 1000,
                  timeFormatOptions
                )}
              </InfoField>
              <InfoField label={__('Sequence')}>
                {transaction.sequence}
              </InfoField>
              <InfoField label={__('Type')}>{transaction.type}</InfoField>
              <InfoField label={__('Confirmations')}>
                {transaction.confirmations}
              </InfoField>
              <InfoField label={__('Transaction ID')}>
                <span className="monospace">{transaction.txid}</span>
              </InfoField>
            </>
          ) : (
            <WaitingMessage>
              {__('Loading transaction details...')}
            </WaitingMessage>
          )}
        </ControlledModal.Body>
      </ControlledModal>
    );
  }
}

export default TransactionDetailsModal;
