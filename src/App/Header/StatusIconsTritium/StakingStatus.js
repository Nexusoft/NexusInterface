// External Dependencies
import { Component } from 'react';
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

__ = __context('Header');

/**
 * Handles the Staking Status
 *
 * @class StakingStatus
 * @extends {React.Component}
 */
@connect((state) => {
  const {
    user: {
      stakeInfo: { stakerate, pooled },
    },
  } = state;
  return {
    staking: isStaking(state),
    stakerate,
    pooled,
    synchronized: isSynchronized(state),
  };
})
class StakingStatus extends Component {
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof StakingStatus
   */
  render() {
    const { staking, stakerate, pooled, synchronized } = this.props;

    return (
      <Tooltip.Trigger
        tooltip={
          staking ? (
            synchronized ? (
              <>
                <div>
                  <strong>
                    {__('Wallet is staking')}
                    {!!pooled && ` (${__('pooled')})`}
                  </strong>
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
