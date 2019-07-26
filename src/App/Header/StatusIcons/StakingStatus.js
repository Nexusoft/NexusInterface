// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import { formatPercent } from 'lib/intl';
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
      info: { stakeweight, stakerate, trustweight, blockweight },
    },
  } = state;
  return {
    staking: isStaking(state),
    stakeweight,
    stakerate,
    trustweight,
    blockweight,
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
    const {
      staking,
      stakeweight,
      stakerate,
      trustweight,
      blockweight,
    } = this.props;

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
              <>
                <div>
                  {__('Stake Rate')}: {formatPercent(stakerate)}%
                </div>
                <div>
                  {__('Trust Weight')}: {formatPercent(trustweight)}%
                </div>
                <div>
                  {__('Block Weight')}: {formatPercent(blockweight)}%
                </div>
                <div>
                  {__('Stake Weight')}: {formatPercent(stakeweight)}%
                </div>
              </>
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
