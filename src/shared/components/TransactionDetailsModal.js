import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { clipboard } from 'electron';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import WaitingMessage from 'components/WaitingMessage';
import { callAPI } from 'lib/api';
import { openErrorDialog } from 'lib/dialog';
import { formatDateTime } from 'lib/intl';
import { fade } from 'utils/color';

__ = __context('TransactionDetails');

const Summary = styled.dl(({ theme }) => ({
  display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, margin: '0 0 24px',
  '> div': { minWidth: 0, padding: 16, borderRadius: 12, background: fade(theme.primary, 0.94), border: `1px solid ${fade(theme.primary, 0.82)}` },
  dt: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: theme.mixer(0.7), marginBottom: 8 },
  dd: { margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1.4, color: theme.foreground, overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' },
  '@media (max-width: 480px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
}));

const Details = styled.dl(({ theme }) => ({
  margin: 0,
  dt: { fontSize: 11, color: theme.mixer(0.7), marginBottom: 8 },
  dd: { margin: 0, fontSize: 14, overflowWrap: 'anywhere', userSelect: 'text' },
  '.transaction-id': { marginTop: 22, padding: 18, borderRadius: 12, background: fade(theme.foreground, 0.98), border: `1px solid ${fade(theme.foreground, 0.89)}` },
  '.id-heading': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  '.id-heading button': { fontSize: 12, minHeight: 36, padding: '6px 12px' },
  code: { fontSize: 12, lineHeight: 1.8, whiteSpace: 'normal', overflowWrap: 'anywhere' },
}));

const Actions = styled.div({
  display: 'flex', justifyContent: 'flex-end',
  button: { minHeight: 42, height: 'auto', padding: '10px 20px' },
});

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export default function TransactionDetailsModal({ txid }) {
  const theme = useTheme();
  const [transaction, setTransaction] = useState(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    setTransaction(null);
    setFailed(false);
    setCopied(false);
    callAPI('ledger/get/transaction', {
      txid,
      verbose: 'summary',
    })
      .then((tx) => {
        if (active) setTransaction(tx);
      })
      .catch((err) => {
        if (!active) return;
        setFailed(true);
        openErrorDialog({
          message: __('Error loading transaction'),
          note: err?.message,
        });
      });
    return () => { active = false; };
  }, [txid]);

  if (theme.modern) {
    const transactionId = transaction?.txid || txid;
    return (
      <ControlledModal maxWidth={800}>
        {(closeModal) => <>
          <ControlledModal.Header>{__('Transaction Details')}</ControlledModal.Header>
          <ControlledModal.Body>
            {transaction ? <>
              <Summary>
                <div><dt>{__('Confirmations')}</dt><dd>{transaction.confirmations ?? '\u2014'}</dd></div>
                <div><dt>{__('Type')}</dt><dd>{transaction.type ?? '\u2014'}</dd></div>
                <div><dt>{__('Sequence')}</dt><dd>{transaction.sequence ?? '\u2014'}</dd></div>
              </Summary>
              <Details>
                <div><dt>{__('Time')}</dt><dd>{transaction.timestamp != null ? formatDateTime(transaction.timestamp * 1000, timeFormatOptions) : '\u2014'}</dd></div>
                <div className="transaction-id">
                  <dt className="id-heading">
                    <span>{__('Transaction ID')}</span>
                    {transactionId && <Button skin="hyperlink" onClick={() => {
                      clipboard.writeText(transactionId);
                      setCopied(true);
                    }}><span aria-live="polite">{copied ? __('Copied') : __('Copy ID')}</span></Button>}
                  </dt>
                  <dd><code>{transactionId || '\u2014'}</code></dd>
                </div>
              </Details>
            </> : failed ? <p role="alert">{__('Error loading transaction')}</p> : (
              <WaitingMessage>{__('Loading transaction details...')}</WaitingMessage>
            )}
          </ControlledModal.Body>
          <ControlledModal.Footer separator>
            <Actions><Button onClick={closeModal}>{__('Close')}</Button></Actions>
          </ControlledModal.Footer>
        </>}
      </ControlledModal>
    );
  }

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
