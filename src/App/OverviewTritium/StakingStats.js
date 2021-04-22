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
import stakeIcon from 'icons/staking-white.svg';

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

function StakingStat({ stakeInfo, value, ...props }) {
  return (
    <Stat
      tooltipAlign="start"
      tooltip={
        stakeInfo?.staking &&
        stakeInfo?.new &&
        __(
          'Staking stats not yet available until you get a genesis transaction'
        )
      }
      linkTo="/User/Staking"
      {...props}
    >
      {value ? formatNumber(value, 2) + '%' : 'N/A'}
    </Stat>
  );
}

export function StakeRateStat() {
  const stakeInfo = useSelector((state) => state.user.stakeInfo);
  return (
    <StakingStat
      stakeInfo={stakeInfo}
      label={__('Stake Rate')}
      value={stakeInfo.stakerate}
      icon={interestIcon}
    />
  );
}

export function BlockWeightStat() {
  const stakeInfo = useSelector((state) => state.user.stakeInfo);
  return (
    <StakingStat
      stakeInfo={stakeInfo}
      label={__('Block Weight')}
      value={stakeInfo.blockweight}
      icon={getBlockWeightIcon(stakeInfo.blockweight)}
    />
  );
}

export function TrustWeightStat() {
  const stakeInfo = useSelector((state) => state.user.stakeInfo);
  return (
    <StakingStat
      stakeInfo={stakeInfo}
      label={__('Trust Weight')}
      value={stakeInfo.trustweight}
      icon={getTrustWeightIcon(stakeInfo.trustweight)}
    />
  );
}

export function StakeWeightStat() {
  const stakeInfo = useSelector((state) => state.user.stakeInfo);
  return (
    <StakingStat
      stakeInfo={stakeInfo}
      label={__('Stake Weight')}
      value={stakeInfo.stakeweight}
      icon={stakeIcon}
    />
  );
}
