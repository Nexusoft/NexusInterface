// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import StatusIcon from 'components/StatusIcon';

import stakingIcon from 'images/staking.sprite.svg';

/**
 * Handles the Staking Status
 *
 * @class StakingStatus
 * @extends {React.Component}
 */
@connect(
  ({
    core: {
      info: { stakeweight, stakerate, trustweight, blockweight },
    },
  }) => ({
    stakeweight,
    stakerate,
    trustweight,
    blockweight,
  })
)
class StakingStatus extends React.Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof StakingStatus
   */
  render() {
    const { stakeweight, stakerate, trustweight, blockweight } = this.props;

    return (
      <Tooltip.Trigger
        tooltip={
          <div>
            <div>
              <Text id="Header.StakeWeight" />: {stakeweight}%
            </div>
            <div>Stake Rate: {stakerate}%</div>
            <div>
              <Text id="Header.TrustWeight" />: {trustweight}%
            </div>
            <div>
              <Text id="Header.BlockWeight" />: {blockweight}%
            </div>
          </div>
        }
        style={{ textAlign: 'left' }}
      >
        <StatusIcon icon={stakingIcon} />
      </Tooltip.Trigger>
    );
  }
}

export default StakingStatus;
