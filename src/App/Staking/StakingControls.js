import { useSelector } from 'react-redux';
import StakingDashboard from './StakingDashboard';

import Button from 'components/Button';
import AdjustStakeModal from 'components/AdjustStakeModal';
import ConfirmDialog from 'components/Dialogs/ConfirmDialog';
import store from 'store';
import { updateSettings } from 'lib/settings';
import { restartCore } from 'lib/core';
import { callAPI } from 'lib/api';
import {
  openModal,
  removeModal,
  showNotification,
} from 'lib/ui';
import {
  confirm,
  confirmPin,
  openInfoDialog,
  openErrorDialog,
} from 'lib/dialog';
import { isSynchronized } from 'selectors';

import TabContentWrapper from './ContentWrapper';
import UT from 'lib/usageTracking';

__ = __context('User.Staking');

function promptForStakeAmount() {
  let completed = false;
  return new Promise((resolve, reject) => {
    openModal(AdjustStakeModal, {
      onComplete: () => {
        completed = true;
        resolve(false);
      },
      onClose: () => {
        if (!completed) {
          resolve(true);
        }
      },
    });
  });
}

export default function Staking() {
  const stakeInfo = useSelector((state) => state.user.stakeInfo);
  const privateNet = useSelector((state) => state.core.systemInfo?.private);

  const startStaking = async () => {
    try {
      const state = store.getState();
      const {
        settings: { liteMode, multiUser, enableStaking },
        user: { status },
      } = state;
      const synchronized = isSynchronized(state);

      if (stakeInfo?.stake === 0) {
        if (stakeInfo?.balance === 0) {
          openErrorDialog({
            message: __('Trust balance empty!'),
            note: __(
              'You must send some NXS to your trust account first.'
            ),
          });
          return;
        } else if (!stakeInfo?.new) {
          const cancelled = await promptForStakeAmount();
          if (cancelled) return;
        }
      }

      if (liteMode || !enableStaking || multiUser) {
        const confirmed = await confirm({
          question: __('Start staking'),
          note: (
            <div style={{ textAlign: 'left' }}>
              <p>
                {__(
                  'In order to start staking, the following settings need to be changed:'
                )}
              </p>
              <ul>
                {!!liteMode && (
                  <li style={{ listStyle: 'initial' }}>
                    {__('Lite mode needs to be turned OFF')}
                  </li>
                )}
                {!!multiUser && (
                  <li style={{ listStyle: 'initial' }}>
                    {__('Multi-user needs to be turned OFF')}
                  </li>
                )}
                {!enableStaking && (
                  <li style={{ listStyle: 'initial' }}>
                    {__('Enable staking needs to be turned ON')}
                  </li>
                )}
              </ul>
            </div>
          ),
          labelYes: __('Apply changes'),
          labelNo: __('Cancel'),
        });
        if (confirmed) {
          updateSettings({
            enableStaking: true,
            liteMode: false,
            multiUser: false,
          });
          UT.StartStake(true);
          restartCore();
          showNotification(__('Restarting Core'));
        } else {
          return;
        }
      }

      if (status?.unlocked?.staking === false) {
        const pin = await confirmPin({
          note: __('Enter your PIN to start staking'),
        });
        if (pin) {
          await callAPI('sessions/unlock/local', { pin, staking: true });
        }
      }

      if (!synchronized) {
        openInfoDialog({
          message: __(
            'Staking will automatically start when your wallet is synchronized'
          ),
        });
      }
    } catch (err) {
      openErrorDialog({
        message: __('Error'),
        note: err?.message || err,
      });
    }
  };

  const stopStaking = async () => {
    const doStop = () => {
      updateSettings({
        enableStaking: false,
      });
      UT.StopStake();
      restartCore();
      showNotification(__('Restarting Core'));
    };
    let confirmed = false;

    if (!stakeInfo.stake) {
      confirmed = await confirm({
        question: __('Stop staking?'),
      });
      if (confirmed) {
        doStop();
      }
    } else {
      const modalId = openModal(ConfirmDialog, {
        question: __('Stop staking?'),
        note: __(
          'If you stop staking, stake amount will still stay locked. In case you want to unlock the stake amount, <link>set your stake amount to 0</link> and keep staking until the next Trust transaction is mined.',
          null,
          {
            link: (text) => (
              <Button
                skin="hyperlink"
                onClick={() => {
                  removeModal(modalId);
                  openModal(AdjustStakeModal, { initialStake: 0 });
                }}
              >
                {text}
              </Button>
            ),
          }
        ),
        labelYes: __('Stop staking'),
        callbackYes: doStop,
        labelNo: __('Cancel'),
      });
    }
  };

  if (privateNet) {
    return (
      <TabContentWrapper maxWidth={400} className="text-center">
        <span className="error">
          {__('Staking is not available in private network')}
        </span>
      </TabContentWrapper>
    );
  }

  return (
    <StakingDashboard onStart={startStaking} onStop={stopStaking} />
  );
}

