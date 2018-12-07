// External Dependencies
import React from 'react'
import { FormattedMessage } from 'react-intl'

// Internal Global Dependencies
import Icon from 'components/common/Icon'
import stakingIcon from 'images/staking.sprite.svg'

const StakingStatus = ({
  stakeweight,
  interestweight,
  trustweight,
  blockweight,
}) => (
  <div className="icon">
    <Icon icon={stakingIcon} />

    <div className="tooltip bottom">
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
  </div>
)

export default StakingStatus
