import { moduleLayout, modulePanel, moduleAction } from 'utils/moduleStyles';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { fade, mix } from 'utils/color';
import Button from 'components/Button';
import Icon from 'components/Icon';
import chartIcon from 'icons/bar-chart.svg';
import settingsIcon from 'icons/settings.svg';
import AdjustStakeModal from 'components/AdjustStakeModal';
import { openModal } from 'lib/ui';
import { formatNumber, formatDateTime } from 'lib/intl';
import ExplorerRankings from './ExplorerRankings';
import { finite, stakingStatus } from './dashboardData';

__ = __context('User.Staking');

const Dashboard = styled.div(({ theme }) => ({
  maxWidth: 1600, margin: '0 auto', padding: theme.modern ? 0 : 20,
  color: theme.foreground,
  '.card': { background: `linear-gradient(135deg, ${theme.mixer(0.055)}, ${theme.background})`, border: `1px solid ${theme.mixer(0.14)}`, borderRadius: 20, padding: 'clamp(20px, 2vw, 30px)', minWidth: 0, boxShadow: `inset 0 1px ${theme.mixer(0.08)}, 0 12px 30px rgba(0,0,0,0.08)` },
  '.hero': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', borderLeft: `3px solid ${theme.primary}`, padding: 'clamp(24px, 3vw, 40px)' },
  '.eyebrow': { textTransform: 'uppercase', letterSpacing: '.14em', fontSize: 11, color: theme.mixer(0.65), marginBottom: 12 },
  '.hero > .notice': { flexBasis: '100%', minWidth: 0, marginTop: 0 },
  '.staking-heading': { display: 'flex', alignItems: 'center', gap: 14 },
  h2: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 500, margin: 0 },
  'h2 svg': { width: 16, height: 16, flexShrink: 0 },
  p: { color: theme.mixer(0.72), fontSize: 13, lineHeight: 1.7, margin: '10px 0 0' },
  '.status': { display: 'flex', gap: 12, alignItems: 'center', fontSize: 26, fontWeight: 500 },
  '.dot': { width: 10, height: 10, flexShrink: 0, borderRadius: '50%', background: theme.mixer(0.45) },
  '.dot[data-active="true"]': { background: theme.primary, boxShadow: `0 0 16px ${theme.primary}` },
  '.actions': { display: 'flex', gap: 12, flexWrap: 'wrap', button: { minHeight: 44, borderRadius: 12 } },
  '.metrics': { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, margin: '20px 0' },
  '.metric-value': { display: 'block', fontSize: 'clamp(28px, 2.6vw, 40px)', fontWeight: 500, letterSpacing: '-.04em', marginTop: 20, overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' },
  '.metrics .card': { position: 'relative', overflow: 'hidden', '&::before': { content: '""', display: 'block', width: 28, height: 3, background: theme.primary, borderRadius: 4, marginBottom: 18 } },
  '.label': { color: theme.mixer(0.75), fontSize: 13 },
  '.unit': { fontSize: 13, color: theme.mixer(0.6), marginLeft: 6 },
  '.details': { display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 20 },
  '.section-heading': { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  '.weight': { marginTop: 16, padding: 18, borderRadius: 14, background: theme.mixer(0.025), border: `1px solid ${theme.mixer(0.09)}` },
  '.weight-heading strong': { color: theme.primary, fontVariantNumeric: 'tabular-nums', fontSize: 18 },
  '.weight-heading, .balance-row': { display: 'flex', justifyContent: 'space-between', gap: 16 },
  '.balance-row': { padding: '12px 0', borderBottom: `1px solid ${theme.mixer(0.12)}`, flexWrap: 'wrap' },
  progress: { appearance: 'none', display: 'block', width: '100%', height: 6, marginTop: 12, border: 0, borderRadius: 8, overflow: 'hidden', background: theme.mixer(0.12), '::-webkit-progress-bar': { background: theme.mixer(0.12) }, '::-webkit-progress-value': { background: theme.primary }, '::-moz-progress-bar': { background: theme.primary } },
  '.rank-grid': { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 20 },
  '.rank': { padding: 24, borderRadius: 14, background: theme.mixer(0.025), border: `1px solid ${theme.mixer(0.12)}`, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13, strong: { fontSize: 28, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }, a: { alignSelf: 'flex-start', marginTop: 'auto' } },
  '.notice': { padding: '14px 18px', marginTop: 20, borderRadius: 12, border: `1px solid ${theme.mixer(0.12)}`, background: theme.mixer(0.04), color: theme.mixer(0.8), fontSize: 13, lineHeight: 1.7 },
  '@media (max-width: 950px)': { '.details': { gridTemplateColumns: 'minmax(0, 1fr)' } },
  '@media (max-width: 520px)': { '.rank-grid': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.actions': { width: '100%', button: { flex: 1 } }, '.status': { fontSize: 22 } },
}), ({ theme }) => theme.modern && ({
  maxWidth: 'none', width: '100%', margin: 0,
  '.card': { padding: moduleLayout.panelPadding, ...modulePanel(theme) },
  '.hero': { padding: moduleLayout.compactPadding, gap: 12 },
  '.eyebrow': { fontSize: 10, letterSpacing: 1.4, marginBottom: 8, color: theme.mixer(0.75) },
  '.status': { fontSize: moduleLayout.titleSize, gap: 10, fontWeight: 600, lineHeight: 1.3 },
  '.hero p': { marginTop: 6, fontSize: 12 },
  '.dot': { width: 8, height: 8 },
  '.actions': { gap: 8 },
  '.actions button': moduleAction,
  'button:focus-visible, a:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '.metrics': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, margin: '14px 0' },
  '.metrics .card': { padding: '16px 18px', background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.09)}, ${theme.background})`, '&::before': { display: 'none' } },
  '.label': { display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase' },
  '.metric-value': { fontSize: 'clamp(18px, 1.6vw, 22px)', fontFamily: '"Consolas", "SFMono-Regular", monospace', fontWeight: 400, lineHeight: 1.3, letterSpacing: '-0.8px', marginTop: 10, textShadow: `0 0 24px ${fade(theme.primary, 0.8)}` },
  '.unit': { fontFamily: 'inherit', fontSize: 11, letterSpacing: 0 },
  '.metrics p': { fontSize: 11, marginTop: 8, lineHeight: 1.6 },
  '.details': { gap: 14, gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)' },
  h2: { color: theme.primary, fontSize: moduleLayout.sectionTitleSize, fontWeight: 600, letterSpacing: 0 },
  p: { fontSize: 12, lineHeight: 1.6 },
  '.weight': { marginTop: 0, padding: '12px 0', border: 0, borderRadius: 0, borderBottom: `1px solid ${fade(theme.foreground, 0.92)}`, background: 'transparent', '&:last-child': { borderBottom: 0, paddingBottom: 0 } },
  '.weight-heading': { fontSize: 13, alignItems: 'center' },
  '.weight-heading strong': { fontSize: 14, fontWeight: 400, fontFamily: '"Consolas", "SFMono-Regular", monospace' },
  progress: { height: 4, marginTop: 10 },
  '.balance-row': { padding: '12px 0', fontSize: 13, borderColor: fade(theme.foreground, 0.92), strong: { fontFamily: '"Consolas", "SFMono-Regular", monospace', fontSize: 13, fontWeight: 400, overflowWrap: 'anywhere' } },
  '.stake-management': { display: 'flex', flexDirection: 'column' },
  '.stake-notice-slot': { marginTop: 'auto', paddingTop: 14 },
  '.notice': { padding: '12px 14px', marginTop: 0, borderRadius: 10, borderColor: fade(theme.primary, 0.82), background: fade(theme.background, 0.25), fontSize: 12 },
  '.rank-grid': { gap: 12, marginTop: 16 },
  '.rank': { padding: '16px 18px', borderRadius: 12, gap: 12, borderColor: fade(theme.primary, 0.82), background: fade(theme.background, 0.25), fontSize: 12, strong: { fontSize: 20, fontWeight: 400, fontFamily: '"Consolas", "SFMono-Regular", monospace' } },
  '@media (max-width: 950px)': { '.metrics': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }, '.details': { gridTemplateColumns: 'minmax(0, 1fr)' } },
  '@media (max-width: 520px)': { '.card': { padding: 16 }, '.metrics': { gridTemplateColumns: 'minmax(0, 1fr)' }, '.status': { fontSize: 17 }, '.rank-grid': { gridTemplateColumns: 'minmax(0, 1fr)' } },
}));

const number = (value, digits = 2) => finite(value) ? formatNumber(value, digits) : '—';

function Metric({ label, value, unit, note }) {
  return <div className="card"><span className="label">{label}</span><strong className="metric-value">{value}<span className="unit">{unit}</span></strong><p>{note}</p></div>;
}

function Weight({ label, value, note }) {
  return <div className="weight"><div className="weight-heading"><span>{label}</span><strong>{number(value)}{finite(value) && '%'}</strong></div>
    {finite(value) && <progress aria-label={label} max={100} value={Math.max(0, Math.min(100, value))} />}
    <p>{note}</p>
  </div>;
}

export default function StakingDashboard({ onStart, onStop }) {
  const info = useSelector((state) => state.user.stakeInfo) || {};
  const system = useSelector((state) => state.core.systemInfo);
  const settings = useSelector((state) => state.settings);
  const status = useSelector((state) => state.user.status);
  const session = useSelector((state) => state.user.session);
  const [busy, setBusy] = useState(false);
  const state = stakingStatus(info, system, settings, status);
  const labels = {
    on: __('Staking is on'), off: __('Staking is off'), syncing: __('Waiting for synchronization'),
    locked: __('Staking is locked'), hold: __('Stake is on hold'), offline: __('Core is disconnected'), unavailable: __('Staking data unavailable'),
  };
  const descriptions = {
    on: info.pooled ? __('Your wallet is participating in pooled staking.') : __('Your wallet is participating in Nexus Proof of Stake.'),
    off: __('Start staking to participate in nPoS and build trust over time.'),
    syncing: __('Staking can begin once your node is fully synchronized.'),
    hold: __('The trust account must finish its holding period before it can stake.'),
    offline: __('Connect to your Core to see live staking data.'),
    unavailable: __('Waiting for staking information from your Core.'),
  };
  const ready = !!system && typeof info.staking === 'boolean';
  const run = async (action) => { setBusy(true); try { await action(); } finally { setBusy(false); } };
  return <Dashboard>
    <section className="card hero">
      <div className="staking-heading"><div><div className="eyebrow">{__('Nexus Proof of Stake')}</div>
        <div className="status" role="status"><span className="dot" data-active={state === 'on'} />{labels[state]}</div>
        {descriptions[state] && <p>{descriptions[state]}</p>}
      </div></div>
      <div className="actions">
        {!info.new && <Button disabled={!ready || busy || (!info.stake && !info.balance)} onClick={() => openModal(AdjustStakeModal)}>{__('Adjust stake')}</Button>}
        <Button skin={info.staking ? 'default' : 'primary'} disabled={!ready || busy} onClick={() => run(info.staking ? onStop : onStart)}>{busy ? __('Please wait…') : info.staking ? __('Stop staking') : __('Start staking')}</Button>
      </div>
      {info.new && <div className="notice">{__('New trust account: waiting for your first Genesis staking transaction. Keep the trust balance unchanged during the initial holding period.')}</div>}
    </section>
    {!!info.onhold && <div className="notice">{__('Holding time remaining')}: {number(info.holdtime, 0)} {__('seconds')}</div>}
    <section className="metrics" aria-label={__('Staking metrics')}>
      <Metric label={__('Stake amount')} value={number(info.stake)} unit="NXS" note={__('Locked in your trust account for staking.')} />
      <Metric label={__('Stake rate')} value={number(info.stakerate, 3)} unit="%" note={__('Current annual staking reward rate.')} />
      <Metric label={__('Trust score')} value={number(info.trust, 0)} note={__('Raw trust score reported by your trust account.')} />
      <Metric label={__('Available balance')} value={number(info.balance)} unit="NXS" note={info.new ? __('Balance awaiting the initial staking transaction.') : __('Unstaked balance in your trust account.')} />
    </section>
    <div className="details">
      <section className="card"><h2><Icon icon={chartIcon} aria-hidden="true" />{__('Staking weights')}</h2><p>{__('Live nPoS indicators reported by your node.')}</p>
        <Weight label={__('Trust weight')} value={info.trustweight} note={__('Weight earned through consistent staking; distinct from your raw trust score.')} />
        <Weight label={__('Block weight')} value={info.blockweight} note={__('Increases between Trust transactions and resets when a new one is minted.')} />
        <Weight label={__('Stake weight')} value={info.stakeweight} note={__('Combines trust and block weight. Together with stake amount, it influences staking frequency.')} />
      </section>
      <section className="card stake-management"><h2><Icon icon={settingsIcon} aria-hidden="true" />{__('Stake management')}</h2>
        <div className="balance-row"><span>{__('Locked stake')}</span><strong>{number(info.stake, 6)} NXS</strong></div>
        <div className="balance-row"><span>{__('Available in trust')}</span><strong>{number(info.balance, 6)} NXS</strong></div>
        <div className="balance-row"><span>{__('Pending adjustment')}</span><strong>{info.change ? `${info.amount > 0 ? '+' : ''}${number(info.amount, 6)} NXS` : ready ? __('None') : '—'}</strong></div>
        {!!info.change && <p>{__('Applied when your next Trust transaction is minted.')}
          {finite(info.requested) && <><br />{__('Requested at')}: {formatDateTime(info.requested * 1000)}</>}
          {!!info.expires && <><br />{__('Expires at')}: {formatDateTime(info.expires * 1000)}</>}
        </p>}
        <div className="stake-notice-slot"><div className="notice">{__('Stopping staking does not unlock your stake. To release it, adjust your stake to zero and keep staking until the change is processed.')}</div></div>
      </section>
      <section className="card" style={{ gridColumn: '1 / -1' }}><ExplorerRankings key={`${session}:${system?.testnet || 0}`} address={info.address} mainnet={!!system && !system.testnet && !system.private} /></section>
    </div>
  </Dashboard>;
}
