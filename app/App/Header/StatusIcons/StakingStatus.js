// External Dependencies
import React from 'react';
import Text from 'components/Text';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import StatusIcon from './StatusIcon';

import stakingIcon from 'images/staking.sprite.svg';

const StakingStatus = ({
  stakeweight,
  interestweight,
  trustweight,
  blockweight,
}) => (
  <Tooltip.Trigger
    align="end"
    tooltip={
      <div>
        <div>
          <Text id="Header.StakeWeight" />: {stakeweight}%
        </div>
        <div>
          <Text id="Header.InterestRate" />: {interestweight}%
        </div>
        <div>
          <Text id="Header.TrustWeight" />: {trustweight}%
        </div>
        <div>
          <Text id="Header.BlockWeight" />: {blockweight}
        </div>
      </div>
    }
  >
    <StatusIcon.Wrapper>
      <StatusIcon icon={stakingIcon} />
    </StatusIcon.Wrapper>
  </Tooltip.Trigger>
);

export default StakingStatus;
