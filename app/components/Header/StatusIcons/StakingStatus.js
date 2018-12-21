// External Dependencies
import React from 'react';
import { FormattedMessage } from 'react-intl';

// Internal Dependencies
import { StatusIcon, StatusIconWrapper, StatusIconTooltip } from './components';

import stakingIcon from 'images/staking.sprite.svg';

const StakingStatus = ({
  stakeweight,
  interestweight,
  trustweight,
  blockweight,
}) => (
  <StatusIconWrapper>
    <StatusIcon icon={stakingIcon} />

    <StatusIconTooltip
      className="tooltip bottom"
      style={{ left: 'auto', transform: 'none', right: -20 }}
    >
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
    </StatusIconTooltip>
  </StatusIconWrapper>
);

export default StakingStatus;
