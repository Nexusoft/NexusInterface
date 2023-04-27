import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import ControlledModal from 'components/ControlledModal';
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

export default function TransactionDetailsModal({ txid }) {
  const minConfirmations = useSelector(
    (state) => state.settings.minConfirmations
  );
  const transaction = useSelector((state) => state.transactions.map[txid]);

  useEffect(() => {
    fetchTransaction(txid);
  }, []);

  return (
    <ControlledModal>
      <ControlledModal.Header>
        {__('Transactions Details')}
      </ControlledModal.Header>
      <ControlledModal.Body>
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
      </ControlledModal.Body>
    </ControlledModal>
  );
}
