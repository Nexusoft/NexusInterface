// External Dependencies
import { useSelector } from 'react-redux';

// Internal Dependencies
import Tooltip from 'components/Tooltip';
import { formatNumber } from 'lib/intl';
import { isStaking } from 'selectors';
import stakingIcon from 'icons/staking.svg';

import StatusIcon from './StatusIcon';

__ = __context('Header');

export default function StakingStatus() {
  const staking = useSelector(isStaking);
  const stakerate = useSelector((state) => state.core.info?.stakerate);
  const genesismature = useSelector((state) => state.core.info?.genesismature);
  const synccomplete = useSelector((state) => state.core.info?.synccomplete);

  return (
    <Tooltip.Trigger
      tooltip={
        staking ? (
          genesismature ? (
            synccomplete === 100 ? (
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
            __(
              'Waiting for average age of balance to exceed 72 hours to start staking...'
            )
          )
        ) : (
          __('Wallet is not staking')
        )
      }
      style={{ maxWidth: 200 }}
    >
      <StatusIcon
        icon={stakingIcon}
        style={{
          opacity: staking && genesismature && synccomplete === 100 ? 1 : 0.7,
        }}
      />
    </Tooltip.Trigger>
  );
}
