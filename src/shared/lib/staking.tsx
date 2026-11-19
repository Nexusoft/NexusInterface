import { atom } from 'jotai';

import AdjustStakeModal from 'components/AdjustStakeModal';
import { StakeInfo, Transaction, callAPI } from 'lib/api';
import { restartCore } from 'lib/core';
import { isSynchronized } from 'lib/coreInfo';
import {
  confirm,
  confirmPin,
  openErrorDialog,
  openInfoDialog,
} from 'lib/dialog';
import {
  stakeInfoQuery,
  userStatusQuery,
  loggedInAtom,
  userGenesisAtom,
  txCountAtom,
} from 'lib/session';
import jotaiQuery from 'utils/jotaiQuery';
import { settingsAtom, updateSettings } from 'lib/settings';
import { store, subscribe } from 'lib/store';
import { openModal, showNotification } from 'lib/ui';
import UT from 'lib/usageTracking';
import StopStakingModal, {
  StopStakingChoice,
} from 'components/StopStakingModal';

__ = __context('User.Staking');

/** Latest staking rewards (Trust and Genesis transactions) */
export const stakeRewardsQuery = jotaiQuery<Transaction[]>({
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['stakeRewards', get(userGenesisAtom)],
    queryFn: () =>
      callAPI('profiles/transactions/master', {
        verbose: 'summary',
        limit: 5,
        where: '(results.contracts.OP=TRUST OR results.contracts.OP=GENESIS)',
      }),
    staleTime: 300000,
    refetchOnMount: 'always',
  }),
  refetchTriggers: [txCountAtom],
});

export type StakingAction = 'starting' | 'stopping' | 'unstaking';

/** Staking action in progress, the staking buttons are disabled meanwhile */
export const stakingActionAtom = atom<StakingAction | null>(null);

async function runAction(action: StakingAction, fn: () => Promise<void>) {
  if (store.get(stakingActionAtom)) return;
  store.set(stakingActionAtom, action);
  try {
    await fn();
  } catch (err: any) {
    console.error(err);
    openErrorDialog({
      message: __('Error'),
      note: err?.message || String(err),
    });
  } finally {
    store.set(stakingActionAtom, null);
  }
}

function promptForStakeAmount() {
  let completed = false;
  return new Promise<boolean>((resolve) => {
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

function chooseStopMode(stakeInfo: StakeInfo) {
  return new Promise<StopStakingChoice>((resolve) => {
    openModal(StopStakingModal, { stakeInfo, onChoose: resolve });
  });
}

async function unlockForStaking() {
  await userStatusQuery.refetch();
  if (!store.get(loggedInAtom)) {
    openInfoDialog({
      message: __('Staking will start after you log in'),
    });
    return;
  }
  const userStatus = store.get(userStatusQuery.valueAtom);
  if (userStatus?.unlocked.staking === false) {
    const pin = await confirmPin({
      note: __('Enter your PIN to start staking'),
    });
    if (!pin) return;
    await callAPI('sessions/unlock/local', { pin, staking: true });
  }
  if (!isSynchronized()) {
    openInfoDialog({
      message: __(
        'Staking will automatically start when your wallet is synchronized'
      ),
    });
  }
}

/**
 * Stop the minter by restarting the core without staking.
 * Locking the session for staking does not stop a running minter in core 5.1
 */
async function stopStakingNow() {
  updateSettings({ enableStaking: false, stopStakingAfterUnstake: false });
  UT.StopStake();
  showNotification(__('Restarting Core'));
  await restartCore();
  stakeInfoQuery.refetch();
}

export function startStaking(stakeInfo: StakeInfo | null | undefined) {
  return runAction('starting', async () => {
    if (!stakeInfo) return;
    const { liteMode, multiUser, enableStaking } = store.get(settingsAtom);

    if (!stakeInfo.stake && !stakeInfo.balance) {
      openErrorDialog({
        message: __('Trust balance empty!'),
        note: __('You must send some NXS to your <b>trust</b> account first'),
      });
      return;
    }

    //an established trust account stakes nothing until a stake amount is set
    if (!stakeInfo.new && !stakeInfo.stake && !stakeInfo.change) {
      const cancelled = await promptForStakeAmount();
      if (cancelled) return;
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
      if (!confirmed) return;

      updateSettings({
        enableStaking: true,
        liteMode: false,
        multiUser: false,
      });
      UT.StartStake();
      showNotification(__('Restarting Core'));
      await restartCore();
    }

    await unlockForStaking();
    stakeInfoQuery.refetch();
  });
}

//set when an unstake request was just sent, until the core lists it as pending
let unstakeRequestPending = false;

async function requestUnstake(stakeInfo: StakeInfo) {
  const pin = await confirmPin({
    note: __('Enter your PIN to unlock your stake'),
  });
  if (!pin) return false;
  //expires 0 = the request stays until the next Trust transaction applies it
  await callAPI('finance/set/stake', { pin, amount: 0, expires: 0 });
  unstakeRequestPending = true;
  updateSettings({ stopStakingAfterUnstake: true });
  UT.AdjustStake('reduce');
  stakeInfoQuery.refetch();
  openInfoDialog({
    message: __('Unstake requested'),
    note: __(
      'Staking continues until your next Trust transaction moves %{amount} NXS back to your available balance. Staking then stops by itself.',
      { amount: stakeInfo.stake }
    ),
  });
  return true;
}

export function stopStaking(stakeInfo: StakeInfo | null | undefined) {
  return runAction('stopping', async () => {
    if (!stakeInfo) return;

    if (!stakeInfo.stake) {
      const confirmed = await confirm({ question: __('Stop staking?') });
      if (confirmed) await stopStakingNow();
      return;
    }

    const choice = await chooseStopMode(stakeInfo);
    if (choice === 'unstake') {
      store.set(stakingActionAtom, 'unstaking');
      await requestUnstake(stakeInfo);
    } else if (choice === 'now') {
      await stopStakingNow();
    }
  });
}

/**
 * Cancel a pending "unstake, then stop": the stake stays and staking goes on
 */
export function keepStaking(stakeInfo: StakeInfo | null | undefined) {
  return runAction('starting', async () => {
    if (!stakeInfo) return;
    const pin = await confirmPin({
      note: __('Enter your PIN to keep your stake'),
    });
    if (!pin) return;
    try {
      //setting the current stake again erases the pending request
      await callAPI('finance/set/stake', { pin, amount: stakeInfo.stake });
    } catch (err: any) {
      if (err?.code !== -78) throw err;
    }
    unstakeRequestPending = false;
    updateSettings({ stopStakingAfterUnstake: false });
    stakeInfoQuery.refetch();
    showNotification(__('Your stake stays and staking continues'), 'success');
  });
}

/**
 * Finish "unstake, then stop" once the Trust transaction applied the change
 */
export function prepareStaking() {
  subscribe(stakeInfoQuery.valueAtom, (stakeInfo) => {
    const { stopStakingAfterUnstake } = store.get(settingsAtom);
    if (!stopStakingAfterUnstake || !stakeInfo) return;

    if (stakeInfo.change) {
      unstakeRequestPending = false;
      return;
    }
    if (unstakeRequestPending) return;

    if (!stakeInfo.stake) {
      runAction('stopping', async () => {
        showNotification(
          __('Your stake is unlocked, stopping staking'),
          'success'
        );
        await stopStakingNow();
      });
      return;
    }

    //no pending change but the stake is still there: the core dropped the request
    updateSettings({ stopStakingAfterUnstake: false });
    openErrorDialog({
      message: __('Unstake request is gone'),
      note: __(
        'The core no longer has the request to unlock your stake, so it was not applied. Staking continues. Use Stop staking to request it again.'
      ),
    });
  });
}
