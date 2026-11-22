import { useEffect, useState } from 'react';
import axios from 'axios';
import Button from 'components/Button';
import Icon from 'components/Icon';
import rankingsIcon from 'icons/chart.svg';
import ExternalLink from 'components/ExternalLink';
import { formatNumber } from 'lib/intl';
import { rankingPosition } from './dashboardData';

__ = __context('User.Staking');

const explorer = 'https://explorer.nexus.io';
const limit = 1000;

export default function ExplorerRankings({ address, mainnet }) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!address || !mainnet) return undefined;
    const controller = new AbortController();
    setResult(null);
    const fetchRank = async (type) => {
      try {
        const rich = type === 'rich';
        const response = await axios.get(`${explorer}/api/v1/mainnet/register/list/${rich ? 'finance:accounts,finance:trust' : 'finance:trust'}`, {
          params: { limit, page: 0, sort: rich ? 'total' : 'trust', order: 'desc', ...(rich ? { where: 'results.token=0' } : {}) },
          timeout: 15000,
          signal: controller.signal,
        });
        const rows = response.data?.result;
        return { rank: rankingPosition(rows, address), count: rows.length };
      } catch (error) {
        return { error: true };
      }
    };
    Promise.all([fetchRank('rich'), fetchRank('trust')]).then(([rich, trust]) => {
      if (!controller.signal.aborted) setResult({ address, rich, trust, updated: new Date() });
    });
    return () => controller.abort();
  }, [address, mainnet, attempt]);

  const current = result?.address === address ? result : null;
  const value = (type) => {
    if (!mainnet) return __('Mainnet only');
    if (!address) return __('Trust account unavailable');
    if (!current) return __('Loading…');
    if (current[type].error) return __('Unavailable');
    return current[type].rank ? `#${formatNumber(current[type].rank, 0)}` : __('Not in the first %{count} entries', { count: current[type].count });
  };
  return (
    <>
      <div className="section-heading"><h2><Icon icon={rankingsIcon} aria-hidden="true" />{__('Explorer rankings')}</h2>
        <Button skin="hyperlink" disabled={!mainnet || !address || !current} onClick={() => setAttempt((n) => n + 1)}>{__('Refresh rankings')}</Button>
      </div>
      <p>{__('Position of your trust account, checking up to the first 1,000 entries on mainnet. Other wallet accounts are ranked separately.')}</p>
      <div className="rank-grid" aria-live="polite">
        {['rich', 'trust'].map((type) => <div key={type} className="rank">
          <span>{type === 'rich' ? __('Rich list') : __('Trust list')}</span>
          <strong>{value(type)}</strong>
          <ExternalLink href={`${explorer}/${type}list`}>{__('View on explorer')} ↗</ExternalLink>
        </div>)}
      </div>
      {current && <p>{__('Last checked')}: {current.updated.toLocaleTimeString()}</p>}
    </>
  );
}
