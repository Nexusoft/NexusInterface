// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import { formatNumber } from 'lib/intl';
import { isStaking } from 'selectors';
import stakingIcon from 'images/staking.sprite.svg';

import StatusIcon from './StatusIcon';

/**
 * Handles the Staking Status
 *
 * @class StakingStatus
 * @extends {React.Component}
 */
@connect(state => {
  const {
    core: {
      info: { stakerate },
    },
  } = state;
  return {
    staking: isStaking(state),
    stakerate,
  };
})
class StakingStatus extends React.Component {
  renderTooltip = () => {};

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof StakingStatus
   */
  render() {
    const { staking, stakerate } = this.props;

    return (
      <Tooltip.Trigger
        tooltip={
          <>
            <div>
              {staking ? (
                <strong>{__('Wallet is staking')}</strong>
              ) : (
                __('Wallet is not staking')
              )}
            </div>
            {staking && (
              <div>
                {__('Stake Rate')}: {formatNumber(stakerate, 2)}%
              </div>
            )}
          </>
        }
        style={{ textAlign: 'left' }}
      >
        <StatusIcon icon={stakingIcon} style={{ opacity: staking ? 1 : 0.7 }} />
      </Tooltip.Trigger>
    );
  }
}

export default StakingStatus;
