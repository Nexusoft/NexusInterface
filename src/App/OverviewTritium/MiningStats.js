// External
import { useSelector } from 'react-redux';

// Internal
import { formatNumber } from 'lib/intl';

// Images
import mathIcon from 'icons/math.svg';
import hashIcon from 'icons/hash.svg';
import nxsStakeIcon from 'icons/nxs-staking.svg';

import Stat from './Stat';

__ = __context('Overview');

function MiningStat({ value, ...props }) {
  return (
    <Stat {...props}>
      {value ? formatNumber(value, 6) : <span className="dim">-</span>}
    </Stat>
  );
}

export function PrimeDiffStat() {
  const ledgerInfo = useSelector((state) => state.core.ledgerInfo);
  return (
    <MiningStat
      label={__('Prime Difficulty')}
      value={ledgerInfo?.prime?.difficulty}
      icon={mathIcon}
    />
  );
}

export function HashDiffStat() {
  const ledgerInfo = useSelector((state) => state.core.ledgerInfo);
  return (
    <MiningStat
      label={__('Hash Difficulty')}
      value={ledgerInfo?.hash?.difficulty}
      icon={hashIcon}
    />
  );
}

export function StakingDiffStat() {
  const ledgerInfo = useSelector((state) => state.core.ledgerInfo);
  return (
    <MiningStat
      label={__('Staking Difficulty')}
      value={ledgerInfo?.stake?.difficulty}
      icon={nxsStakeIcon}
    />
  );
}
