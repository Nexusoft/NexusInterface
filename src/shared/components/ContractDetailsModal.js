import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import CodeBlock from 'components/CodeBlock';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import { openModal } from 'lib/ui';
import { addressRegex } from 'consts/misc';
import { fade } from 'utils/color';

__ = __context('ContractDetails');

const KeyName = styled.span({
  textTransform: 'capitalize',
});

const Summary = styled.div(({ theme }) => ({
  display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12,
  marginBottom: 20,
  '> div': { padding: 16, borderRadius: 12, background: fade(theme.primary, 0.94), border: `1px solid ${fade(theme.primary, 0.82)}`, minWidth: 0 },
  '.label': { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: theme.mixer(0.7), marginBottom: 8 },
  '.value': { fontSize: 20, fontWeight: 600, overflowWrap: 'anywhere', color: theme.foreground },
  '@media (max-width: 480px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
}));

const Fields = styled.dl(({ theme }) => ({
  margin: 0, display: 'grid', gap: 14,
  '> div': { minWidth: 0 },
  dt: { marginBottom: 5, fontSize: 11, color: theme.mixer(0.7) },
  dd: { margin: 0, fontSize: 13, overflowWrap: 'anywhere', userSelect: 'text' },
  pre: { margin: 0, maxWidth: '100%', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' },
}));

const AccountGrid = styled.div({
  display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12, margin: '20px 0',
});

const AccountCard = styled.section(({ theme }) => ({
  minWidth: 0, padding: 18, borderRadius: 14,
  border: `1px solid ${fade(theme.foreground, 0.89)}`, background: fade(theme.foreground, 0.98),
  h3: { margin: '0 0 14px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.4, color: theme.primary },
  'dl': { gap: 0 },
  'dl > div': {
    display: 'grid', gridTemplateColumns: '100px minmax(0, 1fr)', gap: 16,
    alignItems: 'baseline', padding: '9px 0',
  },
  'dl > div + div': { borderTop: `1px solid ${fade(theme.foreground, 0.94)}` },
  'dt': { margin: 0, fontSize: 12 },
  'dd': { minWidth: 0, lineHeight: 1.6 },
  '@media (max-width: 480px)': {
    padding: 14,
    'dl > div': { gridTemplateColumns: '72px minmax(0, 1fr)', gap: 10 },
  },
}));

const Actions = styled.div({
  display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 12,
  button: { minHeight: 42, height: 'auto', whiteSpace: 'normal', padding: '10px 16px' },
});

function DetailFields({ entries }) {
  return <Fields>{entries.map(([key, value]) => (
    <div key={key}><dt>{translateKey(key)}</dt><dd>{value == null ? '\u2014' : displayValue(value, key)}</dd></div>
  ))}</Fields>;
}

function ModernContractDetails({ contract, txid }) {
  const transactionId = txid || contract.txid;
  const summaryKeys = ['OP', 'for', 'amount'].filter((key) => contract[key] != null);
  const accountKeys = ['from', 'to'].filter((key) => contract[key] != null);
  const remaining = Object.entries(contract).filter(([key]) =>
    !['id', 'txid', ...summaryKeys, ...accountKeys].includes(key)
  );
  return (
    <ControlledModal maxWidth={800}>
      {(closeModal) => <>
        <ControlledModal.Header>
          {__('Contract Details')}
          {contract.id != null && <div style={{ fontSize: 12, fontWeight: 400, marginTop: 6 }}>{__('Contract #')} {String(contract.id)}</div>}
        </ControlledModal.Header>
        <ControlledModal.Body>
          {summaryKeys.length > 0 && <Summary>{summaryKeys.map((key) => (
            <div key={key}><div className="label">{translateKey(key)}</div><div className="value">{displayValue(contract[key], key)}</div></div>
          ))}</Summary>}
          {transactionId && <DetailFields entries={[[ 'txid', transactionId ]]} />}
          {accountKeys.length > 0 && <AccountGrid>{accountKeys.map((key) => (
            <AccountCard key={key}>
              <h3>{key === 'from' ? __('From') : __('To')}</h3>
              {typeof contract[key] === 'object' && !Array.isArray(contract[key])
                ? <DetailFields entries={Object.entries(contract[key])} />
                : <DetailFields entries={[[key, contract[key]]]} />}
            </AccountCard>
          ))}</AccountGrid>}
          <DetailFields entries={remaining} />
        </ControlledModal.Body>
        <ControlledModal.Footer separator>
          <Actions>
            <Button onClick={closeModal}>{__('Close')}</Button>
            {transactionId && <Button skin="filled-primary" onClick={() => {
              closeModal();
              openModal(TransactionDetailsModal, { txid: transactionId });
            }}>{__('View transaction details')}</Button>}
          </Actions>
        </ControlledModal.Footer>
      </>}
    </ControlledModal>
  );
}

const translateKey = (key) => {
  switch (key) {
    case 'id':
      return 'Contract #';
    case 'OP':
      return 'Operation';
    case 'txid':
      return 'Transaction ID';
    case 'ticker':
    case 'token_name':
      return 'Token Name';
    case 'from_name':
      return 'From Name';
    case 'json':
      return 'JSON';
    default:
      return <KeyName>{key.replace(/_/g, ' ')}</KeyName>;
  }
};

function displayValue(value, key) {
  if (value === null || value === undefined) return null;

  if (typeof value === 'object') {
    return <CodeBlock>{JSON.stringify(value, null, 2)}</CodeBlock>;
  }

  if (
    (typeof value === 'string' && addressRegex.test(value)) ||
    key === 'txid' ||
    key === 'destination'
  ) {
    return <span className="monospace">{value}</span>;
  }

  return String(value);
}

export default function ContractDetailsModal({ contract, txid }) {
  const theme = useTheme();
  if (!contract) return;
  if (theme.modern) return <ModernContractDetails contract={contract} txid={txid} />;

  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header>
            {__('Contract Details')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            {Object.entries(contract).map(([key, value]) => (
              <InfoField key={key} label={translateKey(key)}>
                {displayValue(value, key)}
              </InfoField>
            ))}
            <InfoField label="">
              <Button
                skin="hyperlink"
                onClick={() => {
                  closeModal();
                  openModal(TransactionDetailsModal, { txid });
                }}
              >
                {__('View transaction details')}
              </Button>
            </InfoField>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
