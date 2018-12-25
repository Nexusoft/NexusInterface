// External Dependencies
import React from 'react';
import { FormattedMessage } from 'react-intl';

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
          <FormattedMessage
            id="Header.StakeWeight"
            defaultMessage="Stake Weight"
          />
          : {stakeweight}%
        </div>
        <div>
          <FormattedMessage
            id="Header.InterestRate"
            defaultMessage="Stake Reward"
          />
          : {interestweight}%
        </div>
        <div>
          <FormattedMessage
            id="Header.TrustWeight"
            defaultMessage="Trust Weight"
          />
          : {trustweight}%
        </div>
        <div>
          <FormattedMessage
            id="Header.BlockWeight"
            defaultMessage="Block Weight"
          />
          : {blockweight}
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
