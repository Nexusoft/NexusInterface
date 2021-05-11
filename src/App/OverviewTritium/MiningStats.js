// External
import { useSelector } from 'react-redux';

// Internal
import { formatNumber } from 'lib/intl';

// Images
import blockweight0 from 'icons/BlockWeight-0.svg';
import blockweight1 from 'icons/BlockWeight-1.svg';
import blockweight2 from 'icons/BlockWeight-2.svg';
import blockweight3 from 'icons/BlockWeight-3.svg';
import blockweight4 from 'icons/BlockWeight-4.svg';
import blockweight5 from 'icons/BlockWeight-5.svg';
import blockweight6 from 'icons/BlockWeight-6.svg';
import blockweight7 from 'icons/BlockWeight-7.svg';
import blockweight8 from 'icons/BlockWeight-8.svg';
import blockweight9 from 'icons/BlockWeight-9.svg';
import trust00 from 'icons/trust00.svg';
import trust10 from 'icons/trust00.svg';
import trust20 from 'icons/trust00.svg';
import trust30 from 'icons/trust00.svg';
import trust40 from 'icons/trust00.svg';
import trust50 from 'icons/trust00.svg';
import trust60 from 'icons/trust00.svg';
import trust70 from 'icons/trust00.svg';
import trust80 from 'icons/trust00.svg';
import trust90 from 'icons/trust00.svg';
import trust100 from 'icons/trust00.svg';
import interestIcon from 'icons/interest.svg';

import Stat from './Stat';

__ = __context('Overview');

function getBlockWeightIcon(blockWeight = 0) {
  const blockWeightIcons = [
    blockweight0,
    blockweight1,
    blockweight2,
    blockweight3,
    blockweight4,
    blockweight5,
    blockweight6,
    blockweight7,
    blockweight8,
    blockweight9,
    blockweight9,
  ];
  const bw = Math.round(blockWeight / 10);
  return blockWeightIcons[bw];
}

function getTrustWeightIcon(trustWeight = 0) {
  const trustIcons = [
    trust00,
    trust10,
    trust20,
    trust30,
    trust40,
    trust50,
    trust60,
    trust70,
    trust80,
    trust90,
    trust100,
  ];
  const tw = Math.round(trustWeight / 10);
  return trustIcons[tw];
}

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
      icon={interestIcon}
    />
  );
}

export function HashDiffStat() {
  const miningInfo = useSelector((state) => state.core.miningInfo);
  return (
    <MiningStat
      label={__('Hash Difficulty')}
      value={miningInfo.hashDifficulty}
      icon={interestIcon}
    />
  );
}

export function StakingDiffStat() {
  const miningInfo = useSelector((state) => state.core.miningInfo);
  return (
    <MiningStat
      label={__('Staking Difficulty')}
      value={miningInfo.stakeDifficulty}
      icon={interestIcon}
    />
  );
}
