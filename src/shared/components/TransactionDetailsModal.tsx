import { useEffect, useState } from 'react';

import ControlledModal from 'components/ControlledModal';
import InfoField from 'components/InfoField';
import WaitingMessage from 'components/WaitingMessage';
import NexusAddress from 'components/NexusAddress';
import ExplorerLink from 'components/ExplorerLink';
import Button from 'components/Button';
import ContractDetailsModal from 'components/ContractDetailsModal';
import { callAPI, Transaction } from 'lib/api';
import { openErrorDialog } from 'lib/dialog';
import { openModal } from 'lib/ui';
import { formatDateTime, formatNumber } from 'lib/intl';

__ = __context('TransactionDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
} as Intl.DateTimeFormatOptions;

export default function TransactionDetailsModal({ txid }: { txid: string }) {
  const [transaction, setTransaction] = useState<Transaction>();
  useEffect(() => {
    callAPI('ledger/get/transaction', {
      txid,
      verbose: 'summary',
    })
      .then((tx) => {
        setTransaction(tx);
      })
      .catch((err) => {
        openErrorDialog({
          message: __('Error loading transaction'),
          note: err?.message,
        });
      });
  }, []);

  return (
    <ControlledModal>
      <ControlledModal.Header>
        {__('Transaction Details')}
      </ControlledModal.Header>
      <ControlledModal.Body>
        {transaction ? (
          <>
            <InfoField label={__('Time')}>
              {formatDateTime(transaction.timestamp * 1000, timeFormatOptions)}
            </InfoField>
            <InfoField label={__('Sequence')}>{transaction.sequence}</InfoField>
            <InfoField label={__('Type')}>{transaction.type}</InfoField>
            <InfoField label={__('Confirmations')}>
              {transaction.confirmations}
            </InfoField>
            <InfoField label={__('Transaction ID')}>
              <NexusAddress
                type="truncateMiddle"
                address={transaction.txid}
                copyable
              />
              <ExplorerLink id={transaction.txid} className="mt0_4" />
            </InfoField>
            {!!transaction.contracts?.length && (
              <InfoField label={__('Contracts')}>
                {transaction.contracts.map((contract) => (
                  <div key={contract.id}>
                    <Button
                      skin="hyperlink"
                      onClick={() => {
                        openModal(ContractDetailsModal, {
                          contract,
                          txid: transaction.txid,
                        });
                      }}
                    >
                      {contract.OP}
                      {typeof contract.amount === 'number' && contract.amount
                        ? ' - ' + formatNumber(contract.amount, 6)
                        : ''}
                    </Button>
                  </div>
                ))}
              </InfoField>
            )}
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
