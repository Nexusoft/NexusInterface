// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
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
      stakeInfo: { stakerate },
      systemInfo: { synchronizing },
    },
  } = state;
  return {
    staking: isStaking(state),
    stakerate,
    synchronizing,
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
    const { staking, stakerate, synchronizing } = this.props;

    return (
      <Tooltip.Trigger
        tooltip={
          staking ? (
            !synchronizing ? (
              <>
                <div>
                  <strong>{__('Wallet is staking')}</strong>
                  {!!stakerate && (
                    <div>
                      {__('Stake Rate')}: {formatNumber(stakerate, 2)}%
                    </div>
                  )}
                </div>
              </>
            ) : (
              __('Waiting for 100% synchronization to start staking...')
            )
          ) : (
            __('Wallet is not staking')
          )
        }
        style={{ maxWidth: 200 }}
      >
        <StatusIcon>
          <Icon
            icon={stakingIcon}
            style={{
              opacity: staking && !synchronizing === 100 ? 1 : 0.7,
            }}
          />
        </StatusIcon>
      </Tooltip.Trigger>
    );
  }
}

export default StakingStatus;
