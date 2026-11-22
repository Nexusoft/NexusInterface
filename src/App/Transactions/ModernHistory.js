import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import Button from 'components/Button';
import Icon from 'components/Icon';
import transactionIcon from 'icons/transaction.svg';
import receiveIcon from 'icons/download.svg';
import sendIcon from 'icons/send.svg';
import userIcon from 'icons/user.svg';
import stakingIcon from 'icons/staking.svg';
import registryIcon from 'icons/blockexplorer-invert-white.svg';
import checkIcon from 'icons/check.svg';
import historyIcon from 'icons/history.svg';
import editIcon from 'icons/edit.svg';
import { moduleLayout, modulePanel } from 'utils/moduleStyles';
import TokenName from 'components/TokenName';
import ContractDetailsModal from 'components/ContractDetailsModal';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import WaitingMessage from 'components/WaitingMessage';
import { openModal } from 'lib/ui';
import { popupContextMenu } from 'lib/contextMenu';
import { formatDateTime, formatNumber } from 'lib/intl';
import { getDeltaSign, updatePage, loadTransactions, fetchAllTransactions } from 'lib/transactions';
import { openErrorDialog } from 'lib/dialog';
import { fade, mix } from 'utils/color';
import CSVDownload from './CSVDownload';
import Filters from './Filters';
import { compactContractContent } from './Contract';

__ = __context('Transactions');

const Panel = styled.section(({ theme }) => ({
  ...modulePanel(theme), display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0,
  borderColor: fade(theme.primary, 0.65), overflow: 'hidden', containerType: 'inline-size', containerName: 'transaction-history',
  color: theme.foreground, lineHeight: 1.5,
  '.heading': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '12px 16px 4px' },
  '.history-title': { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 },
  h2: { margin: 0, fontSize: moduleLayout.titleSize, fontWeight: 600, lineHeight: 1.3 },
  '.history-subtitle': { margin: '4px 0 0', fontSize: 12, lineHeight: 1.5, color: theme.mixer(0.7) },
  '.count': { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: 12, color: theme.mixer(0.65) },
  '.scroll': { flex: 1, minHeight: 0, overflow: 'auto', padding: '0 16px' },
  table: { width: '100%', minWidth: 680, borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 },
  th: { position: 'sticky', top: 0, zIndex: 1, background: mix(theme.background, theme.primary, 0.09), textAlign: 'left', fontSize: 10, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: theme.mixer(0.8), padding: '12px 14px' },
  'th:first-of-type': { borderRadius: '8px 0 0 0' },
  'th:last-of-type': { borderRadius: '0 8px 0 0' },
  td: { padding: '12px 14px', borderBottom: `1px solid ${fade(theme.primary, 0.85)}`, verticalAlign: 'middle' },
  '.date': { width: '12%', whiteSpace: 'nowrap', color: theme.mixer(0.85) },
  '.activity': { width: '24%' },
  '.activity-heading': { paddingLeft: 48 },
  '.activity-content': { display: 'flex', alignItems: 'center', gap: 14 },
  '.activity-content > svg': { width: 20, height: 20, flexShrink: 0, color: theme.primary },
  '.activity-content button': { textAlign: 'left', whiteSpace: 'normal' },
  '.details': { overflowWrap: 'anywhere', minWidth: 0 },
  '.details svg': { display: 'none' },
  '.amount': { textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' },
  'td.amount': { fontSize: 13, fontWeight: 500 },
  '.positive': { color: theme.primary },
  '.negative': { color: mix(theme.danger, theme.foreground, 0.5) },
  '.status-cell': { width: '15%', whiteSpace: 'nowrap', textAlign: 'right' },
  '.status-badge': { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '2px 9px', fontSize: 11, fontWeight: 500, borderRadius: 9, border: '1px solid currentColor' },
  '.status-badge svg': { width: 12, height: 12 },
  '.confirmed': { color: '#65d99a', background: fade('#28b878', 0.9) },
  '.pending': { color: theme.mixer(0.8), background: fade(theme.foreground, 0.96) },
  'tbody tr': { cursor: 'pointer', transition: 'background 150ms ease' },
  'tbody tr:hover, tbody tr:focus-within, tbody tr[data-selected="true"]': { background: fade(theme.primary, 0.88) },
  'tbody tr:hover td:first-of-type, tbody tr:focus-within td:first-of-type, tbody tr[data-selected="true"] td:first-of-type': { boxShadow: `inset 3px 0 ${theme.primary}`, borderRadius: '6px 0 0 6px' },
  'tbody tr:hover td:last-of-type, tbody tr:focus-within td:last-of-type, tbody tr[data-selected="true"] td:last-of-type': { borderRadius: '0 6px 6px 0' },
  '.date button, .activity-content button': { padding: 0, fontSize: 'inherit', color: 'inherit', borderBottom: 0 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: moduleLayout.compactPadding, color: theme.mixer(0.65), fontSize: 12 },
  '.pages': { display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' },
  '.page-arrow': { display: 'block', width: 18, height: 18, flexShrink: 0, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
  '.current-page': { display: 'grid', placeItems: 'center', minWidth: 30, height: 30, padding: '0 6px', border: `1px solid ${theme.primary}`, borderRadius: 7, color: theme.foreground, background: fade(theme.primary, 0.94) },
  '.empty': { textAlign: 'center', padding: 32 },
  '@container transaction-history (max-width: 600px)': { '.heading': { padding: '16px 16px 4px' }, h2: { fontSize: 18 }, '.scroll': { padding: '0 16px' }, footer: { padding: 16 } },
}));

export function activityPresentation(contract, transactionType) {
  const op = contract?.OP || transactionType;
  if (op === 'WRITE') {
    return { label: __('Updated'), icon: editIcon };
  }
  if (op === 'CREATE') {
    const types = { NAME: __('Name created'), NAMESPACE: __('Namespace created'), ACCOUNT: __('Account created'), TRUST: __('Trust created'), TOKEN: __('Token created'), CRYPTO: __('Crypto register'), OBJECT: __('Asset created') };
    return { label: types[contract.type] || __('Register created'), icon: contract.type === 'ACCOUNT' ? userIcon : contract.type === 'TRUST' ? stakingIcon : registryIcon };
  }
  const labels = { CREDIT: __('Received'), DEBIT: __('Sent'), LEGACY: __('Legacy transfer'), COINBASE: __('Mining reward'), TRUST: __('Staking reward'), GENESIS: __('Genesis reward'), TRUSTPOOL: __('Pool staking reward'), GENESISPOOL: __('Pool genesis reward'), FEE: __('Network fee'), TRANSFER: __('Transferred'), CLAIM: __('Claimed'), WRITE: __('Updated'), APPEND: __('Data appended'), MIGRATE: __('Migrated'), AUTHORIZE: __('Authorized') };
  return { label: labels[op] || op || __('Transaction'), icon: op === 'CREDIT' ? receiveIcon : ['DEBIT', 'LEGACY', 'TRANSFER'].includes(op) ? sendIcon : ['TRUST', 'GENESIS', 'TRUSTPOOL', 'GENESISPOOL'].includes(op) ? stakingIcon : transactionIcon };
}

function downloadRows(rows, filename = 'transactions-current-page.csv') {
  const cell = (value) => {
    const text = String(value ?? '');
    // Neutralize spreadsheet formulas in user-controlled names and addresses.
    return `"${(/^[=+\-@\t\r]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`;
  };
  const data = [['Date', 'Type', 'Transaction ID', 'Contract', 'From', 'To', 'Name', 'Address', 'Amount', 'Token'],
    ...rows.map(({ tx, contract: c }) => [new Date(tx.timestamp * 1000).toISOString(), c?.OP || tx.type, tx.txid, c?.id, c?.from?.address || c?.from, c?.to?.address || c?.to, c?.name, c?.address, c?.amount != null ? `${getDeltaSign(c)}${c.amount}` : '', c ? c.ticker || c.token_name || (c.token && c.token !== '0' ? c.token : 'NXS') : ''])];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + data.map((row) => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const transactionRows = (transactions) => (transactions || []).flatMap((tx) =>
    tx.contracts?.length ? tx.contracts.map((contract) => ({ tx, contract })) : [{ tx }]
);

export default function ModernHistory({ transactions, status, page, lastPage }) {
  const [exporting, setExporting] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [exportCount, setExportCount] = useState(0);
  const exportRef = useRef();
  useEffect(() => () => exportRef.current?.abort(), []);
  const rows = status === 'loaded' ? transactionRows(transactions) : [];
  const downloadAll = async () => {
    if (exportRef.current) return;
    const controller = new AbortController();
    exportRef.current = controller;
    setExporting(true);
    setExportCount(0);
    try {
      const all = await fetchAllTransactions({ signal: controller.signal, onProgress: setExportCount });
      if (!controller.signal.aborted) downloadRows(transactionRows(all), 'transactions-all-records.csv');
    } catch (err) {
      if (!controller.signal.aborted) openErrorDialog({ message: __('Unable to export transactions'), note: err?.message });
    } finally {
      exportRef.current = null;
      if (!controller.signal.aborted) setExporting(false);
    }
  };
  return <Panel>
    <div className="heading">
      <div className="history-title"><div><h2>{__('Transactions History')}</h2><p className="history-subtitle">{__('Review your transfers, account activity, and transaction status.')}</p></div></div>
      <div className="count">
        <span>{__('%{count} records', { count: rows.length })}</span>
        {exporting && <span role="status">{__('Preparing CSV: %{count} transactions', { count: exportCount })}</span>}
        <CSVDownload exporting={exporting} disabled={status !== 'loaded'} currentDisabled={!rows.length} downloadCurrent={() => downloadRows(rows)} downloadAll={downloadAll} />
      </div>
    </div>
    <Filters />
    <div className="scroll">
      {status === 'loading' || status === 'notLoaded' ? <WaitingMessage>{__('Loading transactions...')}</WaitingMessage> : status === 'error' ? <div className="empty" role="alert"><p>{__('Failed to load transactions')}</p><Button onClick={loadTransactions}>{__('Retry')}</Button></div> : <table>
        <thead><tr><th>{__('Date')}</th><th className="activity-heading">{__('Activity')}</th><th>{__('Account / Details')}</th><th className="amount">{__('Amount')}</th><th className="status-cell">{__('Status')}</th></tr></thead>
        <tbody>{rows.map(({ tx, contract }, i) => {
          const rowId = `${tx.txid}:${i}`;
          const open = () => { setSelectedRow(rowId); contract ? openModal(ContractDetailsModal, { contract, txid: tx.txid }) : openModal(TransactionDetailsModal, { txid: tx.txid }); };
          const activity = activityPresentation(contract, tx.type);
          const confirmed = Number(tx.confirmations) > 0;
          const sign = contract ? getDeltaSign(contract) : '';
          return <tr key={rowId} data-selected={selectedRow === rowId} onClick={open} onContextMenu={(event) => {
            event.preventDefault();
            popupContextMenu([{ id: 'tx-details', label: __('View transaction details'), click: () => openModal(TransactionDetailsModal, { txid: tx.txid }) }]);
          }}>
            <td className="date"><Button skin="hyperlink" title={__('View transaction details')} onClick={(event) => { event.stopPropagation(); openModal(TransactionDetailsModal, { txid: tx.txid }); }}>{formatDateTime(tx.timestamp * 1000, { month: 'short', day: '2-digit' })}</Button></td>
            <td className="activity"><div className="activity-content"><Icon icon={activity.icon} aria-hidden="true" /><Button skin="hyperlink" onClick={(event) => { event.stopPropagation(); open(); }}>{activity.label}</Button></div></td>
            <td className="details">{contract ? compactContractContent(contract) : tx.type}</td>
            <td className={`amount ${sign === '+' ? 'positive' : sign === '-' ? 'negative' : ''}`}>{contract?.amount != null ? <>{sign}{formatNumber(contract.amount)} {contract.token && contract.token !== '0' ? <TokenName contract={contract} /> : 'NXS'}</> : '\u2014'}</td>
            <td className="status-cell"><span className={`status-badge ${confirmed ? 'confirmed' : 'pending'}`}><Icon icon={confirmed ? checkIcon : historyIcon} aria-hidden="true" />{confirmed ? __('Confirmed') : __('Pending')}</span></td>
          </tr>;
        })}</tbody>
      </table>}
      {status === 'loaded' && !rows.length && <p className="empty">{__('No transactions found')}</p>}
    </div>
    <footer>
      <span>{status === 'loaded' && page === 1 && lastPage ? __('Showing %{count} of %{total}', { count: rows.length, total: rows.length }) : __('Showing %{count} records on this page', { count: rows.length })}</span>
      <div className="pages">
        <Button type="button" skin="plain" square={30} aria-label={__('Previous page')} disabled={page <= 1 || status === 'loading'} onClick={() => updatePage(page - 1)}><svg className="page-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 6-6 6 6 6" /></svg></Button>
        <span className="current-page" aria-current="page">{page}</span>
        <Button type="button" skin="plain" square={30} aria-label={__('Next page')} disabled={lastPage || status !== 'loaded'} onClick={() => updatePage(page + 1)}><svg className="page-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6" /></svg></Button>
      </div>
    </footer>
  </Panel>;
}
