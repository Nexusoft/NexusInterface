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
      info: { stakerate, genesismature },
    },
  } = state;
  return {
    staking: isStaking(state),
    stakerate,
    genesismature,
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
    const { staking, stakerate, genesismature } = this.props;

    return (
      <Tooltip.Trigger
        tooltip={
          staking ? (
            genesismature ? (
              <>
                <div>
                  <strong>{__('Wallet is staking')}</strong>
                  <div>
                    {__('Stake Rate')}: {formatNumber(stakerate, 2)}%
                  </div>
                </div>
              </>
            ) : (
              __('Waiting for average age of balance to exceed 72 hours...')
            )
          ) : (
            __('Wallet is not staking')
          )
        }
        style={{ textAlign: 'left' }}
        style={staking && !genesismature ? { maxWidth: 200 } : undefined}
      >
        <StatusIcon icon={stakingIcon} style={{ opacity: staking ? 1 : 0.7 }} />
      </Tooltip.Trigger>
    );
  }
}

export default StakingStatus;
