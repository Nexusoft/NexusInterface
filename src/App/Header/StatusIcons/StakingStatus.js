// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Text from 'components/Text';
import Tooltip from 'components/Tooltip';
import StatusIcon from 'components/StatusIcon';
import { limitDecimal } from 'utils/etc';

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
              _('Stake Weight'): {limitDecimal(stakeweight, 2)}%
            </div>
            <div>Stake Rate: {limitDecimal(stakerate, 2)}%</div>
            <div>
              _('Trust Weight'): {limitDecimal(trustweight, 2)}%
            </div>
            <div>
              _('Block Weight'): {limitDecimal(blockweight, 2)}%
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
