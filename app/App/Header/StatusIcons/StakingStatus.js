// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import StatusIcon from './StatusIcon';

import stakingIcon from 'images/staking.sprite.svg';

@connect(
  ({
    overview: { stakeweight, interestweight, trustweight, blockweight },
  }) => ({
    stakeweight,
    interestweight,
    trustweight,
    blockweight,
  })
)
class StakingStatus extends React.Component {
  render() {
    const {
      stakeweight,
      interestweight,
      trustweight,
      blockweight,
    } = this.props;

    return (
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
  }
}

export default StakingStatus;
