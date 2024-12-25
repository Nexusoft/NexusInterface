import { createRef, useRef, useEffect } from 'react';
import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import ExternalLink from 'components/ExternalLink';
import BackgroundTask from 'components/BackgroundTask';
import store, { jotaiStore, queryClient } from 'store';
import { callAPI as callAPI } from 'lib/api';
import { coreConnectedAtom, multiUserAtom, liteModeAtom } from './coreInfo';
import {
  openModal,
  isModalOpen,
  showBackgroundTask,
  showNotification,
} from 'lib/ui';
import { confirm } from 'lib/dialog';
import { updateSettings } from 'lib/settings';
import LoginModal from 'components/LoginModal';
import NewUserModal from 'components/NewUserModal';
import UT from './usageTracking';

__ = __context('User');

// export const refreshStakeInfo = async () => {
//   try {
//     const stakeInfo = await callAPI('finance/get/stakeinfo');
//     store.dispatch({ type: TYPE.SET_STAKE_INFO, payload: stakeInfo });
//     return stakeInfo;
//   } catch (err) {
//     store.dispatch({ type: TYPE.CLEAR_STAKE_INFO });
//     console.error('finance/get/stakeinfo failed', err);
//   }
// };

// // Don't refresh user status while login process is not yet done
// let refreshUserStatusLock = false;
// export async function refreshUserStatus() {
//   if (refreshUserStatusLock) return;

//   // If in multiuser mode, fetch the list of logged in sessions first
//   const {
//     core: { systemInfo },
//   } = store.getState();
//   if (systemInfo?.multiuser) {
//     try {
//       const sessions = await callAPI('sessions/list/local');
//       store.dispatch({
//         type: TYPE.SET_SESSIONS,
//         payload: sessions,
//       });
//     } catch (err) {
//       store.dispatch({ type: TYPE.CLEAR_SESSIONS });
//     }
//   }

//   // Get the active user status
//   try {
//     const session = selectActiveSession(store.getState());
//     if (systemInfo?.multiuser && !session) {
//       store.dispatch({ type: TYPE.CLEAR_USER });
//       return;
//     }

//     const status = await callAPI(
//       'sessions/status/local',
//       session ? { session } : undefined
//     );

//     if (store.getState().user.profileStatus?.genesis !== status.genesis) {
//       const profileStatus = await callAPI('profiles/status/master', {
//         genesis: status.genesis,
//         session,
//       });
//       store.dispatch({
//         type: TYPE.SET_PROFILE_STATUS,
//         payload: profileStatus,
//       });
//     }
//     store.dispatch({ type: TYPE.SET_USER_STATUS, payload: status });

//     refreshStakeInfo();
//     return status;
//   } catch (err) {
//     store.dispatch({ type: TYPE.CLEAR_USER });
//     // Don't log error if it's 'Session not found' (user not logged in)
//     if (err?.code !== -11) {
//       console.error('Failed to get user status', err);
//     }
//   }
// }

export const logIn = async ({ username, password, pin }) => {
  const { session: sessionId } = await callAPI('sessions/create/local', {
    username,
    password,
    pin,
  });

  await refetchUserStatus();
  await unlockUser({ pin, sessionId });

  UT.LogIn();
  return { username, sessionId };
};

export const logOut = async () => {
  const sessions = jotaiStore.get(sessionsAtom);
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
  refetchUserStatus();
  UT.LogOut();
};

// export async function setActiveUser({ sessionId, genesis, stakeInfo }) {
//   const {
//     core: { systemInfo },
//   } = store.getState();

//   const [status, profileStatus, sessions, newStakeInfo] = await Promise.all([
//     callAPI('sessions/status/local', { session: sessionId }),
//     callAPI('profiles/status/master', { session: sessionId, genesis }),
//     systemInfo?.multiuser
//       ? callAPI('sessions/list/local')
//       : Promise.resolve(null),
//     stakeInfo
//       ? Promise.resolve(null)
//       : callAPI('finance/get/stakeinfo', { session: sessionId }).catch((err) => {
//           if (err.code !== -70) {
//             // Only ignore 'Trust account not found' error
//             throw err;
//           }
//         }),
//   ]);

//   const result = {
//     sessionId,
//     sessions,
//     status,
//     stakeInfo: stakeInfo || newStakeInfo || null,
//     profileStatus,
//   };
//   store.dispatch({
//     type: TYPE.ACTIVE_USER,
//     payload: result,
//   });
//   return result;
// }

async function shouldUnlockStaking() {
  const {
    settings: { enableStaking, dontAskToStartStaking },
  } = store.getState();
  if (
    jotaiStore.get(liteModeAtom) ||
    jotaiStore.get(multiUserAtom) ||
    !enableStaking
  ) {
    return false;
  }

  const stakeInfo = await queryClient.ensureQueryData({
    queryKey: ['stakeInfo', jotaiStore.get(userGenesisAtom)],
  });
  if (!stakeInfo?.new) {
    return true;
  }

  const startStakingAsked = jotaiStore.get(startStakingAskedAtom);
  if (
    stakeInfo?.new &&
    stakeInfo?.balance &&
    !startStakingAsked &&
    !dontAskToStartStaking
  ) {
    let checkboxRef = createRef();
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
              null,
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
    jotaiStore.set(startStakingAsked, true);
    if (checkboxRef.current?.checked) {
      updateSettings({ dontAskToStartStaking: true });
    }
    if (accepted) {
      return true;
    }
  }

  return false;
}

async function unlockUser({ pin, sessionId }) {
  const unlockStaking = await shouldUnlockStaking();
  const {
    settings: { enableMining },
  } = store.getState();
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
    const indexing = jotaiStore.get(userIndexingAtom);
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
}) {
  const closeTaskRef = useRef();
  useEffect(
    () =>
      jotaiStore.sub(userIndexingAtom, async () => {
        const indexing = jotaiStore.get(userIndexingAtom);
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
      onClick={null}
      style={{ cursor: 'default' }}
    >
      {__('Indexing User...')}
    </BackgroundTask>
  );
}

/**
 * New
 * =============================================================================
 */

const sessionsPollingAtom = atomWithQuery((get) => ({
  queryKey: ['sessions'],
  queryFn: () => callAPI('sessions/list/local'),
  enabled: !!get(multiUserAtom),
  retry: 5,
  retryDelay: (attempt) => 500 + attempt * 1000,
  staleTime: 600000, // 10 minutes
  refetchInterval: 10000, // 10 seconds
  refetchIntervalInBackground: true,
  refetchOnReconnect: 'always',
  placeholderData: (previousData) => previousData,
}));

export const sessionsAtom = atom((get) => {
  if (!get(multiUserAtom)) {
    return null;
  }
  const query = get(sessionsPollingAtom);
  if (!query || query.isError) {
    return null;
  } else {
    return query.data;
  }
});

export const selectedSessionIdAtom = atom(null);

export const activeSessionIdAtom = atom((get) => {
  const selectedSessionId = get(selectedSessionIdAtom);
  if (selectedSessionId) return selectedSessionId;

  const sessions = get(sessionsAtom);
  if (!sessions) return null;

  const sessionList = Object.values(sessions);
  if (!sessionList.length) return null;

  // Active session is defaulted to the last accessed session
  const lastAccessed = sessionList.reduce(
    (las, s) => (!las || s.accessed > las.accessed ? s : las),
    null
  );
  return lastAccessed?.session || null;
});

export const activeSessionAtom = atom((get) => {
  const sessions = get(sessionsAtom);
  const activeSessionId = get(activeSessionIdAtom);
  return (activeSessionId && sessions?.[activeSessionId]) || null;
});

/**
 * User & profile status
 * =============================================================================
 */

export const userStatusPollingAtom = atomWithQuery((get) => ({
  queryKey: ['userStatus', get(activeSessionIdAtom)],
  queryFn: async () => {
    const sessionId = get(activeSessionIdAtom);
    try {
      const result = await callAPI(
        'sessions/status/local',
        sessionId ? { session: sessionId } : undefined
      );
      return result;
    } catch (err) {
      // Don't log error if it's 'Session not found' (user not logged in)
      if (err?.code === -11) {
        return null;
      }
      console.error(err);
      throw err;
    }
  },
  enabled:
    get(coreConnectedAtom) && (!get(multiUserAtom) || get(activeSessionIdAtom)),
  retry: 0,
  refetchInterval: ({ state: { data } }) => (data?.indexing ? 1000 : 10000), // 1 second if indexing, else 10 seconds
}));

export const userStatusAtom = atom((get) => {
  const query = get(userStatusPollingAtom);
  if (
    !query ||
    query.isError ||
    !get(coreConnectedAtom) ||
    (get(multiUserAtom) && !get(activeSessionIdAtom))
  ) {
    return null;
  } else {
    return query.data;
  }
});

const refetchUserStatusAtom = atom(
  (get) => get(userStatusPollingAtom)?.refetch || (() => {})
);

export function refetchUserStatus() {
  return jotaiStore.get(refetchUserStatusAtom)?.();
}

export const loggedInAtom = atom((get) => !!get(userStatusAtom));
export const userGenesisAtom = atom((get) => get(userStatusAtom)?.genesis);
export const hasRecoveryPhraseAtom = atom(
  (get) => !!get(profileStatusAtom)?.recovery
);
const userIndexingAtom = atom((get) => get(userStatusAtom)?.indexing);

export const profileStatusPollingAtom = atomWithQuery((get) => ({
  queryKey: ['profileStatus', get(userGenesisAtom)],
  queryFn: async () => {
    const genesis = get(userGenesisAtom);
    return await callAPI('profiles/status/master', {
      genesis,
    });
  },
  enabled: get(loggedInAtom),
  retry: 2,
  refetchInterval: 10000, // 10 seconds
}));

export const profileStatusAtom = atom((get) => {
  const query = get(profileStatusPollingAtom);
  if (!query || query.isError || !get(loggedInAtom)) {
    return null;
  } else {
    return query.data;
  }
});

const refetchProfileStatusAtom = atom(
  (get) => get(profileStatusPollingAtom)?.refetch || (() => {})
);

export function refetchProfileStatus() {
  jotaiStore.get(refetchProfileStatusAtom)?.();
}

export const usernameAtom = atom((get) => {
  const profileStatus = get(profileStatusAtom);
  const userStatus = get(userStatusAtom);
  const activeSession = get(activeSessionAtom);

  return (
    profileStatus?.session?.username ||
    userStatus?.username ||
    activeSession?.username ||
    ''
  );
});

export function prepareSessionInfo() {
  jotaiStore.sub(coreConnectedAtom, async () => {
    const coreConnected = jotaiStore.get(coreConnectedAtom);
    if (coreConnected) {
      const userStatus = await queryClient.ensureQueryData({
        queryKey: ['userStatus', jotaiStore.get(activeSessionIdAtom)],
      });
      // Query has just finished, userStatusAtom and loggedInAtom haven't been updated yet
      const loggedIn = !!userStatus;
      const state = store.getState();
      // The wallet will have to refresh after language is chosen
      // So NewUser modal shouldn't be visible now
      if (
        state.settings.locale &&
        !loggedIn &&
        !isModalOpen(LoginModal) &&
        !isModalOpen(NewUserModal)
      ) {
        if (state.settings.firstCreateNewUserShown) {
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

export const stakeInfoPollingAtom = atomWithQuery((get) => ({
  queryKey: ['stakeInfo', get(userGenesisAtom)],
  queryFn: async () => {
    try {
      return await callAPI('finance/get/stakeinfo');
    } catch (err) {
      // Ignore 'Trust account not found' error
      if (err.code === -70) {
        return null;
      }
      console.error(err);
      throw err;
    }
  },
  enabled: get(loggedInAtom),
  retry: 0,
  refetchInterval: ({ state: { data } }) => (data?.staking ? 10000 : 60000), // 10 seconds if staking, 1 minute if not
}));

export const stakeInfoAtom = atom(
  (get) => get(stakeInfoPollingAtom)?.data || null
);

const refetchStakeInfoAtom = atom(
  (get) => get(stakeInfoPollingAtom)?.refetch || (() => {})
);

export function refetchStakeInfo() {
  jotaiStore.get(refetchStakeInfoAtom)?.();
}

const startStakingAskedAtom = atom(false);
export const stakingAtom = atom((get) => !!get(stakeInfoAtom)?.staking);
