// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { isSynchronized } from 'selectors';
import { formatNumber } from 'lib/intl';
import { isStaking } from 'selectors';
import stakingIcon from 'icons/staking.svg';

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
      systemInfo: { synchronizing, synccomplete },
    },
  } = state;
  return {
    staking: isStaking(state),
    stakerate,
    synchronized: isSynchronized(state),
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
    const { staking, stakerate, synchronized } = this.props;

    return (
      <Tooltip.Trigger
        tooltip={
          staking ? (
            synchronized ? (
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
          <Link to="/User/Staking">
            <Icon
              icon={stakingIcon}
              style={{
                opacity: staking && synchronized ? 1 : 0.7,
              }}
            />
          </Link>
        </StatusIcon>
      </Tooltip.Trigger>
    );
  }
}

export default StakingStatus;
