import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { animations } from 'styles';
import Icon from 'components/Icon';
import TransactionDetailsModal from 'components/TransactionDetailsModal';
import TokenName from 'components/TokenName';
import { openModal } from 'lib/ui';
import { callAPI } from 'lib/api';
import { getDeltaSign } from 'lib/transactions';
import { formatNumber, formatDateTime } from 'lib/intl';
import { isCoreConnected, isLoggedIn, isSynchronized } from 'selectors';
import { fade, mix } from 'utils/color';
import walletIcon from 'icons/wallet.svg';
import lockIcon from 'icons/padlock.svg';
import checkIcon from 'icons/check.svg';
import syncingIcon from 'icons/syncing.svg';
import peersIcon from 'icons/Connections16.svg';
import sendIcon from 'icons/send.svg';
import receiveIcon from 'icons/download.svg';
import contactsIcon from 'icons/address-book.svg';
import historyIcon from 'icons/history.svg';

__ = __context('Overview');

const Dashboard = styled.div(({ theme }) => ({
  position: 'relative', zIndex: 1, flex: '1 1 0', minWidth: 0, minHeight: 0, display: 'grid',
  gridTemplateRows: 'auto minmax(180px, 1fr) auto', gap: 'clamp(8px, 1.4vh, 14px)',
  color: theme.foreground, fontSize: 12,
  '.summary': { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoRows: '1fr', gap: 14 },
  '.main, .bottom': { minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(260px, 1fr)', gap: 14 },
  '.side': { display: 'grid', gap: 'clamp(8px, 1.4vh, 14px)', gridTemplateRows: 'auto minmax(0, 1fr)', minWidth: 0, minHeight: 0 },
  '.panel': { display: 'flex', flexDirection: 'column', minHeight: 0 },
  '.side .panel, .bottom .panel': { overflow: 'auto' },
  '.card, .panel': { minWidth: 0, border: `1px solid ${fade(theme.primary, 0.6)}`, borderRadius: 10,
    background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.07)}, ${fade(theme.background, 0.08)})`, overflow: 'hidden' },
  '.card': { display: 'flex', alignItems: 'center', gap: 16, padding: 'clamp(10px, 1.6vh, 18px) 16px', minHeight: 'clamp(68px, 9vh, 88px)' },
  '.card > svg': { color: theme.primary, width: 24, height: 24, flexShrink: 0 },
  '.card > svg.syncing': { animation: `${animations.spin} 2s linear infinite`, transformOrigin: 'center' },
  '.card > div': { borderLeft: `1px solid ${fade(theme.primary, 0.65)}`, paddingLeft: 16, minWidth: 0 },
  '.card h2': { fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', margin: '0 0 6px', color: theme.mixer(0.7) },
  '.card strong': { display: 'block', fontSize: 'clamp(14px, 1.2vw, 18px)', lineHeight: 1.25, overflowWrap: 'anywhere' },
  '.card small': { display: 'block', marginTop: 5, color: theme.mixer(0.7), fontSize: 9 },
  '.balance em': { color: theme.primary, fontStyle: 'normal' },
  '.panel-heading': { flexShrink: 0, minHeight: 36, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '9px 15px', borderBottom: `1px solid ${fade(theme.primary, 0.7)}` },
  '.panel-heading h2': { margin: 0, fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase' },
  '.panel-heading > svg': { color: theme.primary, width: 19, height: 19 },
  '.panel-heading a, .legend': { marginLeft: 'auto', fontSize: 10 },
  '.legend': { display: 'flex', alignItems: 'center', gap: 10, color: theme.mixer(0.8) },
  '.live': { border: `1px solid ${fade(theme.primary, 0.5)}`, borderRadius: 4, padding: '3px 7px', color: theme.primary, letterSpacing: 1 },
  '.panel.map-panel': { background: 'transparent' },
  '.map-panel > .panel-heading': { background: mix(theme.background, theme.primary, 0.07) },
  '.map-canvas': { position: 'relative', flex: '1 1 0', minHeight: 0, minWidth: 0, background: 'transparent' },
  '.actions': { display: 'grid', gap: 8, padding: 14 },
  '.action': { display: 'flex', alignItems: 'center', gap: 14, padding: '9px 12px', border: `1px solid ${fade(theme.primary, 0.55)}`, borderRadius: 7, color: theme.foreground, fontWeight: 600 },
  '.action:first-of-type': { background: `linear-gradient(120deg, ${fade(theme.primary, 0.25)}, ${fade(theme.primary, 0.75)})` },
  '.action svg': { width: 18, height: 18 }, '.action span:last-child': { marginLeft: 'auto' },
  'a': { color: theme.primary, textDecoration: 'none' },
  'a:hover, button:hover': { filter: 'brightness(1.2)' },
  'a:focus-visible, button:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: -2 },
  '.facts': { padding: '3px 15px', margin: 0 },
  '.fact': { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: `1px solid ${fade(theme.primary, 0.87)}` },
  '.fact:last-child': { borderBottom: 0 }, 'dt': { color: theme.mixer(0.75) }, 'dd': { margin: 0, textAlign: 'right', fontWeight: 600 },
  '.trend': { padding: '8px 15px 12px', color: theme.primary }, '.trend svg': { display: 'block', width: '100%', height: 35 },
  '.trend small': { color: theme.mixer(0.6), fontSize: 10 },
  '.side .network-health': { overflow: 'hidden' },
  '.network-health .facts': { flexShrink: 0, padding: '4px 15px' },
  '.network-health .fact': { padding: '8px 0', fontSize: 11, lineHeight: 1.4 },
  '.network-health .trend': {
    flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column',
    gap: 6, padding: '6px 15px 12px',
  },
  '.network-health .trend small': { flexShrink: 0, lineHeight: '14px' },
  '.network-health .trend svg': { flex: '1 1 0', minHeight: 0, height: 'auto' },
  '.activity': { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
  '.activity td': { padding: '10px 14px', borderBottom: `1px solid ${fade(theme.primary, 0.85)}` },
  '.activity tr:last-child td': { borderBottom: 0 }, '.activity td:first-of-type': { width: '40%' },
  '.activity button': { display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 0, color: theme.foreground, padding: 0, textAlign: 'left', cursor: 'pointer' },
  '.activity svg': { color: theme.primary, width: 20, height: 20, flexShrink: 0 },
  '.activity small': { display: 'block', color: theme.mixer(0.6), marginTop: 3 },
  '.amount': { fontWeight: 600, whiteSpace: 'nowrap' }, '.incoming': { color: theme.primary },
  '.date': { textAlign: 'right', color: theme.mixer(0.7) },
  '.empty': { padding: 24, textAlign: 'center', color: theme.mixer(0.65) },
  '.retry': { border: 0, background: 'none', color: theme.primary, cursor: 'pointer', padding: 8 },
  '@media (max-height: 760px)': {
    '.card': { gap: 10, padding: '9px 12px', minHeight: 64 },
    '.card > svg': { width: 20, height: 20 }, '.card > div': { paddingLeft: 10 },
    '.card strong': { fontSize: 15 }, '.card h2': { marginBottom: 4 },
    '.panel-heading': { minHeight: 30, padding: '6px 12px' },
    '.actions': { padding: 8, gap: 5 }, '.action': { padding: '6px 10px' },
    '.fact': { padding: '7px 0' }, '.activity td': { padding: '7px 12px' },
    '.trend': { padding: '3px 12px 6px' }, '.trend svg': { height: 22 },
    '.empty': { padding: 12, margin: 0 },
  },
  '@media (max-width: 900px)': {
    flex: '1 0 auto', gridTemplateRows: 'auto auto auto',
    '.summary': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '.main': { minHeight: 320 }, '.date': { display: 'none' },
  },
  '@media (max-width: 780px)': { '.main, .bottom': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.side': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: 'auto' }, '.map-canvas': { flex: 'none', height: 'clamp(240px, 45vh, 360px)' } },
  '@media (max-width: 500px)': { '.summary, .side': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.legend': { marginLeft: 0 }, '.activity td': { padding: 10 } },
}));

function Heading({ icon, title, children }) {
  return <header className="panel-heading"><Icon icon={icon} aria-hidden="true" /><h2>{title}</h2>{children}</header>;
}

// Independent preview data: never change the full transaction page's filters.
function useWalletPreview(owner, enabled) {
  const [state, setState] = useState({});
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!enabled || !owner) return undefined;
    let disposed = false;
    let timer;
    setState({ owner, loading: true });
    const refresh = async () => {
      const [balances, transactions] = await Promise.allSettled([
        callAPI('finance/get/balances'),
        callAPI('profiles/transactions/master', { verbose: 'summary', limit: 3, page: 0 }),
      ]);
      if (disposed) return;
      setState({ owner, loading: false,
        balances: balances.status === 'fulfilled' && Array.isArray(balances.value) ? balances.value : undefined,
        transactions: transactions.status === 'fulfilled' && Array.isArray(transactions.value) ? transactions.value : undefined });
      timer = setTimeout(refresh, 15000);
    };
    refresh();
    return () => { disposed = true; clearTimeout(timer); };
  }, [owner, enabled, retry]);
  return [enabled && state.owner === owner ? state : {}, () => setRetry(n => n + 1)];
}

export default function MapOverview({ children }) {
  const connected = useSelector(isCoreConnected);
  const loggedIn = useSelector(isLoggedIn);
  const synchronized = useSelector(isSynchronized);
  const info = useSelector(state => state.core.systemInfo);
  const owner = useSelector(state => state.user.status?.genesis);
  const settings = useSelector(state => state.settings);
  const [preview, retry] = useWalletPreview(owner, loggedIn && connected);
  const waitingForPreview = loggedIn && connected && (!preview.owner || preview.loading);
  const [layoutReady, setLayoutReady] = useState(false);
  useEffect(() => {
    setLayoutReady(false);
    if (waitingForPreview) return undefined;
    // Let the loaded content establish its natural grid dimensions and give
    // the map a frame to fit its camera before revealing the dashboard.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setLayoutReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [waitingForPreview, owner]);
  const [samples, setSamples] = useState([]);
  const count = info?.connections;
  useEffect(() => {
    if (!connected || !Number.isFinite(count)) { setSamples([]); return undefined; }
    const sample = () => setSamples(values => [...values.slice(-29), count]);
    sample();
    const timer = setInterval(sample, 10000);
    return () => clearInterval(timer);
  }, [connected, count]);
  const nxs = preview.balances?.find(balance => balance.token === '0');
  const amount = value => settings.hideOverviewBalances || !loggedIn || value == null ? '—' : formatNumber(value);
  const total = nxs ? (nxs.available || 0) + (nxs.stake || 0) : undefined;
  const syncProgress = info?.syncing?.progress;
  const syncLabel = !connected ? __('Offline') : synchronized ? __('Synchronized') : `${__('Synchronizing')}${syncProgress != null ? ` ${syncProgress}%` : ''}`;
  const low = samples.length ? Math.min(...samples) : 0;
  const high = samples.length ? Math.max(...samples) : 0;
  const midpoint = (low + high) / 2;
  const range = Math.max(2, high - low);
  // Show a baseline immediately while the first history samples accumulate.
  const hasPeerData = connected && Number.isFinite(count);
  const points = samples.length > 1
    ? samples.map((value, i) => `${i * 280 / (samples.length - 1)},${18 - (value - midpoint) / range * 24}`).join(' ')
    : '0,18 280,18';
  return <Dashboard aria-busy={!!waitingForPreview || !layoutReady}
    style={{ visibility: waitingForPreview || !layoutReady ? 'hidden' : 'visible' }}>
    <div className="summary">
      <section className="card balance"><Icon icon={walletIcon} /><div><h2>{__('Total balance')}</h2><strong>{amount(total)} <em>NXS</em></strong>{connected && !synchronized && <small>{__('Balance may be out of date')}</small>}</div></section>
      <section className="card"><Icon icon={lockIcon} /><div><h2>{__('Login Status')}</h2><strong>{loggedIn ? __('Signed in') : __('Signed out')}</strong></div></section>
      <section className="card"><Icon className={connected && !synchronized ? 'syncing' : undefined} icon={synchronized && connected ? checkIcon : syncingIcon} /><div><h2>{__('Blockchain sync')}</h2><strong>{syncLabel}</strong></div></section>
      <section className="card"><Icon icon={peersIcon} /><div><h2>{__('Network peers')}</h2><strong>{count != null ? __('%{count} Connected', { count }) : '—'}</strong></div></section>
    </div>
    <div className="main">
      <section className="panel map-panel"><Heading icon={peersIcon} title={__('Global peer network')}><div className="legend"><span>{__('Connected nodes')}</span><span className="live">{count > 0 ? __('● LIVE') : __('OFFLINE')}</span></div></Heading><div className="map-canvas">{children}</div></section>
      <aside className="side">
        <section className="panel"><Heading icon={sendIcon} title={__('Quick actions')} /><nav className="actions" aria-label={__('Quick actions')}>
          <Link className="action" to="/Send"><Icon icon={sendIcon} /><span>{__('Send NXS')}</span><span aria-hidden="true">›</span></Link>
          <Link className="action" to="/Wallets"><Icon icon={receiveIcon} /><span>{__('Receive NXS')}</span><span aria-hidden="true">›</span></Link>
          <Link className="action" to="/AddressBook"><Icon icon={contactsIcon} /><span>{__('Address Book')}</span><span aria-hidden="true">›</span></Link>
        </nav></section>
        <section className="panel network-health"><Heading icon={peersIcon} title={__('Network health')} /><dl className="facts">
          <div className="fact"><dt>{__('Core connection')}</dt><dd>{connected ? __('Connected') : __('Offline')}</dd></div>
          <div className="fact"><dt>{__('Last block')}</dt><dd>{info?.blocks != null ? formatNumber(info.blocks, 0) : '—'}</dd></div>
        </dl><div className="trend"><small>{__('Peer stability')}</small>{hasPeerData && <svg viewBox="0 0 280 36" preserveAspectRatio="none" role="img" aria-label={__('Peer stability')}><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>}</div></section>
      </aside>
    </div>
    <div className="bottom">
      <section className="panel"><Heading icon={historyIcon} title={__('Recent activity')}><Link to="/Transactions">{__('View all transactions')} ›</Link></Heading>
        {!loggedIn ? <p className="empty">{__('Sign in to view recent activity')}</p> : !connected ? <p className="empty">{__('Waiting for Core')}</p> : !preview.owner || preview.loading ? <p className="empty">{__('Loading transactions...')}</p> : !preview.transactions ? <div className="empty">{__('Unable to load recent activity')} <button className="retry" onClick={retry}>{__('Retry')}</button></div> : !preview.transactions.length ? <p className="empty">{__('No transactions yet')}</p> : <table className="activity"><tbody>{preview.transactions.map(tx => {
          const contract = tx.contracts?.find(c => c.amount != null && c.OP !== 'FEE') || tx.contracts?.[0];
          const sign = contract ? getDeltaSign(contract) : '';
          const label = sign === '+' ? __('Received') : sign === '-' ? __('Sent') : contract?.OP || tx.type || __('Transaction');
          return <tr key={tx.txid}><td><button onClick={() => openModal(TransactionDetailsModal, { txid: tx.txid })}><Icon icon={sign === '+' ? receiveIcon : sendIcon} /><span>{label}<small>{tx.txid?.slice(0, 10)}…{tx.txid?.slice(-6)}</small></span></button></td>
            <td className={`amount ${sign === '+' ? 'incoming' : ''}`}>{settings.hideOverviewBalances ? '—' : contract?.amount != null ? <>{sign}{formatNumber(contract.amount)} {contract.token && contract.token !== '0' ? <TokenName contract={contract} /> : 'NXS'}</> : '—'}</td>
            <td className="date">{tx.timestamp ? formatDateTime(tx.timestamp * 1000, { month: 'short', day: '2-digit' }) : '—'}</td></tr>;
        })}</tbody></table>}
      </section>
      <section className="panel"><Heading icon={walletIcon} title={__('Wallet insights')} /><dl className="facts">
        <div className="fact"><dt>{__('Available balance')}</dt><dd>{amount(nxs?.available)} NXS</dd></div>
        <div className="fact"><dt>{__('Staked balance')}</dt><dd>{amount(nxs?.stake)} NXS</dd></div>
        <div className="fact"><dt>{__('Unconfirmed balance')}</dt><dd>{amount(nxs?.unconfirmed)} NXS</dd></div>
      </dl></section>
    </div>
  </Dashboard>;
}

