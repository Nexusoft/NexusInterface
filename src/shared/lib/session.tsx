import { createRef, useRef, useEffect } from 'react';
import { atom } from 'jotai';
import ExternalLink from 'components/ExternalLink';
import BackgroundTask from 'components/BackgroundTask';
import { store, subscribe, queryClient } from 'lib/store';
import {
  callAPI,
  Session,
  UserStatus,
  ProfileStatus,
  StakeInfo,
} from 'lib/api';
import { coreConnectedAtom, multiUserAtom, liteModeAtom } from 'lib/coreInfo';
import {
  openModal,
  isModalOpen,
  showBackgroundTask,
  showNotification,
} from 'lib/ui';
import { confirm } from 'lib/dialog';
import { updateSettings, settingsAtom, settingAtoms } from 'lib/settings';
import jotaiQuery from 'utils/jotaiQuery';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import { BackgroundTaskProps } from 'components/BackgroundTask';
import UT from './usageTracking';

__ = __context('User');

export const logIn = async ({
  username,
  password,
  pin,
}: {
  username: string;
  password: string;
  pin: string;
}) => {
  const { session: sessionId } = await callAPI('sessions/create/local', {
    username,
    password,
    pin,
  });

  await userStatusQuery.refetch();
  await unlockUser({ pin, sessionId });

  UT.LogIn();
  return { username, sessionId };
};

export const logOut = async () => {
  const sessions = store.get(sessionsQuery.valueAtom);
  if (sessions) {
    await Promise.all([
      Object.keys(sessions).map((session) => {
        callAPI('sessions/terminate/local', { session });
      }),
    ]);
  } else {
    await callAPI('sessions/terminate/local');
  }
  queryClient.clear();
  userStatusQuery.refetch();
  UT.LogOut();
};

/**
 * Sessions
 * =============================================================================
 */

export const sessionsQuery = jotaiQuery<Session[]>({
  alwaysOn: true,
  condition: (get) => !!get(multiUserAtom),
  getQueryConfig: (get) => ({
    queryKey: ['sessions', !!get(settingAtoms.manualDaemon)],
    queryFn: () => callAPI('sessions/list/local'),
    retry: 5,
    retryDelay: (attempt) => 500 + attempt * 1000,
    staleTime: 600000, // 10 minutes
    refetchInterval: 10000, // 10 seconds
    refetchIntervalInBackground: true,
    refetchOnReconnect: 'always',
    placeholderData: (previousData) => previousData,
  }),
});

export const selectedSessionIdAtom = atom<string | null>(null);

export const activeSessionIdAtom = atom((get) => {
  const selectedSessionId = get(selectedSessionIdAtom);
  if (selectedSessionId) return selectedSessionId;

  const sessions = get(sessionsQuery.valueAtom);
  if (!sessions || !sessions.length) return null;

  // Active session is defaulted to the last accessed session
  const lastAccessed = sessions.reduce(
    (las, s) => (!las || s.accessed > las.accessed ? s : las),
    null as Session | null
  );
  return lastAccessed?.session || null;
});

export const activeSessionAtom = atom((get) => {
  const sessions = get(sessionsQuery.valueAtom);
  const activeSessionId = get(activeSessionIdAtom);
  if (!activeSessionId || !sessions) return null;
  const activeSession = sessions.find((s) => s.session === activeSessionId);
  return activeSession || null;
});

/**
 * User & profile status
 * =============================================================================
 */

export const userStatusQuery = jotaiQuery<UserStatus | null>({
  alwaysOn: true,
  condition: (get) =>
    get(coreConnectedAtom) &&
    (!get(multiUserAtom) || !!get(activeSessionIdAtom)),
  getQueryConfig: (get) => ({
    queryKey: ['userStatus', get(activeSessionIdAtom)],
    queryFn: async () => {
      const sessionId = get(activeSessionIdAtom);
      try {
        const userStatus = await callAPI(
          'sessions/status/local',
          sessionId ? { session: sessionId } : undefined
        );
        return userStatus;
      } catch (err: any) {
        // Don't log error if it's 'Session not found' (user not logged in)
        if (err?.code === -11) {
          return null;
        }
        console.error(err);
        throw err;
      }
    },
    retry: 0,
    refetchInterval: ({ state: { data } }) => (data?.indexing ? 1000 : 10000), // 1 second if indexing, else 10 seconds
  }),
});

export const loggedInAtom = atom((get) => !!get(userStatusQuery.valueAtom));
export const userGenesisAtom = atom(
  (get) => get(userStatusQuery.valueAtom)?.genesis
);
export const hasRecoveryPhraseAtom = atom(
  (get) => !!get(profileStatusQuery.valueAtom)?.recovery
);
const userIndexingAtom = atom(
  (get) => get(userStatusQuery.valueAtom)?.indexing
);

export const profileStatusQuery = jotaiQuery<ProfileStatus>({
  alwaysOn: true,
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['profileStatus', get(userGenesisAtom)],
    queryFn: async () => {
      const genesis = get(userGenesisAtom);
      const profileStatus = await callAPI('profiles/status/master', {
        genesis,
      });
      return profileStatus;
    },
    retry: 2,
    refetchInterval: 10000, // 10 seconds
  }),
});

export const txCountAtom = atom(
  (get) => get(profileStatusQuery.valueAtom)?.transactions
);

export const usernameAtom = atom((get) => {
  const profileStatus = get(profileStatusQuery.valueAtom);
  const activeSession = get(activeSessionAtom);

  return profileStatus?.session?.username || activeSession?.username || '';
});

export function prepareSessionInfo() {
  subscribe(coreConnectedAtom, async (coreConnected) => {
    if (coreConnected) {
      const userStatus = await queryClient.ensureQueryData({
        queryKey: ['userStatus', store.get(activeSessionIdAtom)],
      });
      // Query has just finished, userStatusQuery and loggedInAtom haven't been updated yet
      const loggedIn = !!userStatus;
      const { locale, firstCreateNewUserShown } = store.get(settingsAtom);
      // The wallet will have to refresh after language is chosen
      // So NewUser modal shouldn't be visible now
      if (
        locale &&
        !loggedIn &&
        !isModalOpen(LoginModal) &&
        !isModalOpen(NewUserModal)
      ) {
        if (firstCreateNewUserShown) {
          openModal(LoginModal);
        } else {
          openModal(NewUserModal);
          updateSettings({ firstCreateNewUserShown: true });
        }
      }
    }
  });
}

/**
 * Stake info
 * =============================================================================
 */

export const stakeInfoQuery = jotaiQuery<StakeInfo | null>({
  alwaysOn: true,
  condition: (get) => get(loggedInAtom),
  getQueryConfig: (get) => ({
    queryKey: ['stakeInfo', get(userGenesisAtom)],
    queryFn: async () => {
      try {
        return await callAPI('finance/get/stakeinfo');
      } catch (err: any) {
        // Ignore 'Trust account not found' error
        if (err.code === -70) {
          return null;
        }
        console.error(err);
        throw err;
      }
    },
    retry: 0,
    refetchInterval: ({ state: { data } }) => (data?.staking ? 10000 : 60000), // 10 seconds if staking, 1 minute if not
  }),
});

const startStakingAskedAtom = atom(false);
export const stakingAtom = atom(
  (get) => !!get(stakeInfoQuery.valueAtom)?.staking
);

async function shouldUnlockStaking() {
  const { enableStaking, dontAskToStartStaking } = store.get(settingsAtom);
  if (store.get(liteModeAtom) || store.get(multiUserAtom) || !enableStaking) {
    return false;
  }

  const stakeInfo = await queryClient.ensureQueryData<StakeInfo | null>({
    queryKey: ['stakeInfo', store.get(userGenesisAtom)],
  });
  if (!stakeInfo?.new) {
    return true;
  }

  const startStakingAsked = store.get(startStakingAskedAtom);
  if (
    stakeInfo?.new &&
    stakeInfo?.balance &&
    !startStakingAsked &&
    !dontAskToStartStaking
  ) {
    let checkboxRef = createRef<HTMLInputElement>();
    const accepted = await confirm({
      question: __('Start staking?'),
      note: (
        <div style={{ textAlign: 'left' }}>
          <p>
            {__(
              'You have %{amount} NXS in your trust account and can start staking now.',
              {
                amount: stakeInfo.balance,
              }
            )}
          </p>
          <p>
            {__(
              'However, keep in mind that if you start staking, your stake amount will be locked, and the smaller the amount is, the longer it would likely take to unlock it.'
            )}
          </p>
          <p>
            {__(
              'To learn more about staking, visit <link>crypto.nexus.io/stake</link>.',
              undefined,
              {
                link: () => (
                  <ExternalLink href="https://crypto.nexus.io/staking-guide">
                    crypto.nexus.io/staking-guide
                  </ExternalLink>
                ),
              }
            )}
          </p>
          <div className="mt3">
            <label>
              <input type="checkbox" ref={checkboxRef} />{' '}
              {__("Don't show this again")}
            </label>
          </div>
        </div>
      ),
      labelYes: __('Start staking'),
      labelNo: __("Don't stake"),
    });
    store.set(startStakingAskedAtom, true);
    if (checkboxRef.current?.checked) {
      updateSettings({ dontAskToStartStaking: true });
    }
    if (accepted) {
      return true;
    }
  }

  return false;
}

async function unlockUser({
  pin,
  sessionId,
}: {
  pin: string;
  sessionId?: string;
}) {
  const unlockStaking = await shouldUnlockStaking();
  const { enableMining } = store.get(settingsAtom);
  try {
    await callAPI('sessions/unlock/local', {
      pin,
      notifications: true,
      staking: unlockStaking,
      mining: !!enableMining,
      // passing session through because it's not saved in the store yet
      // so it wouldn't be automatically passed in all API calls
      session: sessionId || undefined,
    });
  } catch (error) {
    const indexing = store.get(userIndexingAtom);
    if (indexing) {
      showBackgroundTask(UserUnLockIndexingBackgroundTask, {
        pin,
        notifications: true,
        staking: unlockStaking,
        mining: !!enableMining,
        sessionId,
      });
    } else throw error;
  }
}

function UserUnLockIndexingBackgroundTask({
  pin,
  notifications,
  staking,
  mining,
  sessionId,
  ...rest
}: BackgroundTaskProps & {
  pin: string;
  notifications: boolean;
  staking: boolean;
  mining: boolean;
  sessionId?: string;
}) {
  const closeTaskRef = useRef(() => {});
  useEffect(
    () =>
      subscribe(userIndexingAtom, async (indexing) => {
        if (!indexing) {
          try {
            await callAPI('sessions/unlock/local', {
              pin,
              notifications,
              staking,
              mining,
              session: sessionId || undefined,
            });
            showNotification(__('User Unlocked'), 'success');
          } catch (error) {
            showNotification(__('User Failed to Unlock'), 'error');
          }
          closeTaskRef.current?.();
        }
      }),
    []
  );

  return (
    <BackgroundTask
      assignClose={(close) => (closeTaskRef.current = close)}
      style={{ cursor: 'default' }}
      {...rest}
    >
      {__('Indexing User...')}
    </BackgroundTask>
  );
}
