// External Dependencies
import React from 'react';
import { connect } from 'react-redux';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import StatusIcon from 'components/StatusIcon';
import { limitDecimal } from 'utils/etc';
import { isStaking } from 'selectors';

import stakingIcon from 'images/staking.sprite.svg';

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
                  {__('Stake Weight')}: {limitDecimal(stakeweight, 2)}%
                </div>
                <div>
                  {__('Stake Rate')}: {limitDecimal(stakerate, 2)}%
                </div>
                <div>
                  {__('Trust Weight')}: {limitDecimal(trustweight, 2)}%
                </div>
                <div>
                  {__('Block Weight')}: {limitDecimal(blockweight, 2)}%
                </div>
              </>
            )}
          </>
        }
        style={{ textAlign: 'left' }}
      >
        <StatusIcon
          icon={stakingIcon}
          className={staking ? undefined : 'dim'}
        />
      </Tooltip.Trigger>
    );
  }
}

export default StakingStatus;
