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
  const miningInfo = useSelector((state) => state.core.miningInfo);
  return (
    <MiningStat
      label={__('Prime Difficulty')}
      value={miningInfo.primeDifficulty}
      icon={mathIcon}
    />
  );
}

export function HashDiffStat() {
  const miningInfo = useSelector((state) => state.core.miningInfo);
  return (
    <MiningStat
      label={__('Hash Difficulty')}
      value={miningInfo.hashDifficulty}
      icon={hashIcon}
    />
  );
}

export function StakingDiffStat() {
  const miningInfo = useSelector((state) => state.core.miningInfo);
  return (
    <MiningStat
      label={__('Staking Difficulty')}
      value={miningInfo.stakeDifficulty}
      icon={nxsStakeIcon}
    />
  );
}
