import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { callAPI } from 'lib/api';
import { formatDateTime } from 'lib/intl';
import { isCoreConnected } from 'selectors';
import { fade } from 'utils/color';

__ = __context('User');

const Details = styled.dl(({ theme }) => ({
  display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, margin: 0,
  '> div': { padding: '14px 16px', borderRadius: 10, border: `1px solid ${fade(theme.primary, 0.88)}`, background: fade(theme.background, 0.35) },
  dt: { fontSize: 11, color: theme.mixer(0.6), marginBottom: 6 },
  dd: { margin: 0, fontSize: 13, overflowWrap: 'anywhere' },
  '@media (max-width: 540px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
}));

const statusPulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  80%, 100% { transform: scale(2.5); opacity: 0; }
`;

const Status = styled.span(({ theme }) => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 20, fontSize: 12, lineHeight: 1.5,
  '.status-dot': {
    position: 'relative', width: 7, height: 7, borderRadius: '50%', background: 'currentColor', flexShrink: 0,
    '&::after': { content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'currentColor', animation: `${statusPulse} 2s ease-out infinite` },
  },
  '@media (prefers-reduced-motion: reduce)': { '.status-dot::after': { animation: 'none', display: 'none' } },
  '&.configured': { color: theme.modern ? '#59d99a' : '#23834c', background: fade('#59d99a', 0.9) },
  '&.not-configured': { color: theme.modern ? '#f0bc60' : '#946000', background: fade('#f0bc60', 0.9) },
  '&.unavailable': { color: theme.mixer(0.6), background: fade(theme.foreground, 0.94) },
}));

export function RecoveryStatus({ genesis, compact = false }) {
  const profile = useSelector((state) => state.user.profileStatus);
  const recovery = profile?.genesis === genesis ? profile.recovery : undefined;
  const pending = profile?.genesis === genesis && profile?.recoveryPending;
  return <Status role="status" className={pending ? 'not-configured' : recovery === true ? 'configured' : recovery === false ? 'not-configured' : 'unavailable'}>
    <span className="status-dot" aria-hidden="true" />
    {pending ? __('Adding recovery phrase to blockchain') : recovery === true ? (compact ? __('Recovery configured') : __('Configured')) : recovery === false ? (compact ? __('Recovery not configured') : __('Not configured')) : (compact ? __('Recovery status unavailable') : __('Unavailable'))}
  </Status>;
}

export function UserCreationDate({ genesis }) {
  const connected = useSelector(isCoreConnected);
  const [creation, setCreation] = useState({ loading: true });
  useEffect(() => {
    let active = true;
    if (!connected || !genesis) {
      setCreation({ loading: false });
      return;
    }
    setCreation({ loading: true });
    callAPI('profiles/transactions/master', { genesis, order: 'asc', limit: 1, page: 0, verbose: 'summary' })
      .then((transactions) => {
        const timestamp = Number(transactions?.[0]?.timestamp);
        const valid = Number.isFinite(timestamp) && timestamp > 0 && !Number.isNaN(new Date(timestamp * 1000).getTime());
        if (active) setCreation({ loading: false, timestamp: valid ? timestamp : null });
      })
      .catch(() => { if (active) setCreation({ loading: false }); });
    return () => { active = false; };
  }, [genesis, connected]);

  return <>{creation.loading ? __('Loading...') : creation.timestamp ? formatDateTime(creation.timestamp * 1000, { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : __('Unavailable')}</>;
}

export default function ProfileDetails({ genesis }) {
  return <Details>
    <div><dt>{__('User created')}</dt><dd><UserCreationDate key={genesis} genesis={genesis} /></dd></div>
    <div><dt>{__('Recovery phrase')}</dt><dd><RecoveryStatus genesis={genesis} /></dd></div>
  </Details>;
}
