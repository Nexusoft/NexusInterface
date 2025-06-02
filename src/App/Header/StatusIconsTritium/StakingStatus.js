// External Dependencies
import { Link } from 'react-router';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import { useSynchronized } from 'lib/coreInfo';
import { stakeInfoQuery } from 'lib/session';
import { formatNumber } from 'lib/intl';
import stakingIcon from 'icons/staking.svg';

import StatusIcon from './StatusIcon';

__ = __context('Header');

export default function StakingStatus() {
  const { staking, stakeRate, pooled } = stakeInfoQuery.use() || {};
  const synchronized = useSynchronized();

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
                {!!stakeRate && (
                  <div>
                    {__('Stake Rate')}: {formatNumber(stakeRate, 2)}%
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
