import styled from '@emotion/styled';

import Button from 'components/Button';
import AdjustStakeModal from 'components/AdjustStakeModal';
import ConfirmDialog from 'components/Dialogs/ConfirmDialog';
import { store } from 'lib/store';
import { updateSettings, settingsAtom } from 'lib/settings';
import { restartCore } from 'lib/core';
import { userStatusQuery, stakeInfoQuery } from 'lib/session';
import { callAPI } from 'lib/api';
import { useCoreInfo, isSynchronized } from 'lib/coreInfo';
import { openModal, removeModal, showNotification } from 'lib/ui';
import {
  confirm,
  confirmPin,
  openInfoDialog,
  openErrorDialog,
} from 'lib/dialog';
import { formatNumber, formatDateTime } from 'lib/intl';
import QuestionCircle from 'components/QuestionCircle';

import { useUserTab } from './atoms';
import TabContentWrapper from './TabContentWrapper';
import UT from 'lib/usageTracking';

__ = __context('User.Staking');

const dateTimeFormat = {
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const Line = styled.div(
  {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '.4em',
  },
  ({ bold, theme }) =>
    bold && {
      fontWeight: 'bold',
      color: theme.foreground,
    }
);

const Pending = styled.div({
  paddingLeft: '1em',
});

const BalanceTooltip = (staking) =>
  staking
    ? __(
        'The current NXS balance of the trust account that is not staked. You can spend this amount without affecting your Trust Score'
      )
    : __(
        'Balance that will be staked after the 72 holding period, any change to this balance will reset the hold timer'
      );

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
  useUserTab('Staking');
  const stakeInfo = stakeInfoQuery.use();
  const coreInfo = useCoreInfo();
  const privateNet = coreInfo?.private;

  const startStaking = async () => {
    try {
      const { liteMode, multiUser, enableStaking } = store.get(settingsAtom);
      const synchronized = isSynchronized();

      if (stakeInfo?.amount === 0) {
        if (stakeInfo?.balance === 0) {
          openErrorDialog({
            message: __('Trust balance empty!'),
            note: __(
              'You must send some NXS to your <b>trust</b> account first'
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

      const userStatus = store.get(userStatusQuery.valueAtom);
      if (userStatus?.unlocked.staking === false) {
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
      updateSettings({ enableStaking: false });
      UT.StopStake();
      restartCore();
      showNotification(__('Restarting Core'));
    };
    let confirmed = false;

    if (stakeInfo?.amount) {
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

  if (!stakeInfo) {
    return null;
  }

  return (
    <TabContentWrapper maxWidth={400}>
      <Line bold>
        <div>{__('Status')}</div>
        <div>
          {stakeInfo.staking ? (
            <span>
              {__('Staking')}
              {!!stakeInfo.pooled && ` (${__('pooled')})`}
            </span>
          ) : (
            __('Not staking')
          )}
        </div>
      </Line>
      <Line>
        <div>
          <span className="v-align">{__('Stake amount (locked)')}</span>
          <QuestionCircle
            tooltip={__(
              'The amount of NXS currently staked in the trust account'
            )}
          />
        </div>
        <div>{formatNumber(stakeInfo.stake, 6)} NXS</div>
      </Line>
      {!!stakeInfo.change && (
        <div>
          <Pending>
            <Line>
              <div>
                <span className="v-align">{__('Pending change')}</span>
                <QuestionCircle
                  tooltip={__(
                    'The pending stake amount change that will be applied on the next Trust transaction'
                  )}
                />
              </div>
              <div>
                {stakeInfo.amount > 0 && '+'}
                {formatNumber(stakeInfo.amount, 6)} NXS
              </div>
            </Line>
            <Line>
              <div>
                <span className="v-align">{__('Requested at')}</span>
              </div>
              <div>
                {formatDateTime(stakeInfo.requested * 1000, dateTimeFormat)}
              </div>
            </Line>
            {!!stakeInfo.expires && (
              <Line>
                <div>
                  <span className="v-align">{__('Expired in')}</span>
                </div>
                <div>
                  {formatDateTime(stakeInfo.expires * 1000, dateTimeFormat)}{' '}
                </div>
              </Line>
            )}
          </Pending>
        </div>
      )}
      <Line>
        <div>
          <span className="v-align">{__('Stake Rate')}</span>
          <QuestionCircle
            tooltip={__('The current annual reward rate earned for staking')}
          />
        </div>
        <div>{formatNumber(stakeInfo.stakerate, 3)} %</div>
      </Line>
      <Line>
        <div>
          <span className="v-align">{__('Trust Weight')}</span>
          <QuestionCircle
            tooltip={__(
              'The percentage of the maximum Trust Score, which is gradually built over time when you consistently operate your node in an honest, trustworthy, and timely manner'
            )}
          />
        </div>
        <div>{formatNumber(stakeInfo.trustweight, 3)} %</div>
      </Line>
      <Line>
        <div>
          <span className="v-align">{__('Block Weight')}</span>
          <QuestionCircle
            tooltip={__(
              'Block Weight depends on the time passed since you received a Trust transaction and will be reset everytime you receive a Trust transaction. Otherwise, Block Weight will reach 100% after 3 days and your Trust Score will start decaying until you receive another Trust transaction'
            )}
          />
        </div>
        <div>{formatNumber(stakeInfo.blockweight, 3)} %</div>
      </Line>
      <Line>
        <div>
          <span className="v-align">{__('Stake Weight')}</span>
          <QuestionCircle
            tooltip={__(
              'Stake Weight depends on Trust Weight and Block Weight. Along with your Stake amount, Stake Weight affects how frequent you receive a Trust transaction'
            )}
          />
        </div>
        <div>{formatNumber(stakeInfo.stakeweight, 3)} %</div>
      </Line>
      <Line>
        <div>
          <span className="v-align">{__('Available Balance')}</span>
          <QuestionCircle tooltip={BalanceTooltip(!stakeInfo.new)} />
        </div>
        <div>{formatNumber(stakeInfo.balance, 6)} NXS</div>
      </Line>
      <div className="mt1 flex space-between">
        <div>
          {!stakeInfo.new && (
            <>
              <Button
                disabled={!stakeInfo.stake && !stakeInfo.balance}
                onClick={() => {
                  openModal(AdjustStakeModal);
                }}
              >
                {__('Adjust stake amount')}
              </Button>
              {stakeInfo.onhold && (
                <div className="error">
                  {__('Account on hold for another %{stakeSeconds} Seconds', {
                    stakeSeconds: stakeInfo.holdtime,
                  })}
                </div>
              )}
            </>
          )}
        </div>
        {stakeInfo.staking ? (
          <Button skin="default" onClick={stopStaking}>
            {__('Stop staking')}
          </Button>
        ) : (
          <Button skin="primary" onClick={startStaking}>
            {__('Start staking')}
          </Button>
        )}
      </div>
    </TabContentWrapper>
  );
}
