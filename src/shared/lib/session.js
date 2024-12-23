import { createRef, useRef, useEffect } from 'react';
import { atom } from 'jotai';
import ExternalLink from 'components/ExternalLink';
import BackgroundTask from 'components/BackgroundTask';
import * as TYPE from 'consts/actionTypes';
import store, { observeStore } from 'store';
import { callAPI as callAPI } from 'lib/api';
import { showBackgroundTask, showNotification } from 'lib/ui';
import { confirm } from 'lib/dialog';
import { updateSettings } from 'lib/settings';
import sleep from 'utils/promisified/sleep';
import UT from './usageTracking';

__ = __context('User');

export const selectActiveSession = ({ user: { session }, sessions }) => {
  if (session) return session;
  if (!sessions) return undefined;
  const sessionList = Object.values(sessions);
  if (!sessionList.length) return undefined;

  // Active session is defaulted to the last accessed session
  let lastAccessed = sessionList.reduce(
    (las, s) => (!las || s.accessed > las.accessed ? s : las),
    undefined
  );
  return lastAccessed?.session || undefined;
};

export const selectUsername = (state) => {
  const {
    user: { status, profileStatus },
    sessions,
  } = state;
  const session = selectActiveSession(state);

  return (
    profileStatus?.session?.username ||
    status?.username ||
    (session && sessions?.[session]?.username) ||
    ''
  );
};

export const refreshStakeInfo = async () => {
  try {
    const stakeInfo = await callAPI('finance/get/stakeinfo');
    store.dispatch({ type: TYPE.SET_STAKE_INFO, payload: stakeInfo });
    return stakeInfo;
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_STAKE_INFO });
    console.error('finance/get/stakeinfo failed', err);
  }
};

// Don't refresh user status while login process is not yet done
let refreshUserStatusLock = false;
export async function refreshUserStatus() {
  if (refreshUserStatusLock) return;

  // If in multiuser mode, fetch the list of logged in sessions first
  const {
    core: { systemInfo },
  } = store.getState();
  if (systemInfo?.multiuser) {
    try {
      const sessions = await callAPI('sessions/list/local');
      store.dispatch({
        type: TYPE.SET_SESSIONS,
        payload: sessions,
      });
    } catch (err) {
      store.dispatch({ type: TYPE.CLEAR_SESSIONS });
    }
  }

  // Get the active user status
  try {
    const session = selectActiveSession(store.getState());
    if (systemInfo?.multiuser && !session) {
      store.dispatch({ type: TYPE.CLEAR_USER });
      return;
    }

    const status = await callAPI(
      'sessions/status/local',
      session ? { session } : undefined
    );

    if (store.getState().user.profileStatus?.genesis !== status.genesis) {
      const profileStatus = await callAPI('profiles/status/master', {
        genesis: status.genesis,
        session,
      });
      store.dispatch({
        type: TYPE.SET_PROFILE_STATUS,
        payload: profileStatus,
      });
    }
    store.dispatch({ type: TYPE.SET_USER_STATUS, payload: status });

    refreshStakeInfo();
    return status;
  } catch (err) {
    store.dispatch({ type: TYPE.CLEAR_USER });
    // Don't log error if it's 'Session not found' (user not logged in)
    if (err?.code !== -11) {
      console.error('Failed to get user status', err);
    }
  }
}

export const logIn = async ({ username, password, pin }) => {
  // Stop refreshing user status
  refreshUserStatusLock = true;
  await sleep(500); // Let the core cycle, Possible delete this
  try {
    const { session, genesis } = await callAPI('sessions/create/local', {
      username,
      password,
      pin,
    });

    let stakeInfo = null;
    try {
      stakeInfo = await callAPI('finance/get/stakeinfo', { session });
    } catch (err) {
      if (err.code !== -70) {
        // Only ignore 'Trust account not found' error
        throw err;
      }
    }
    await unlockUser({ pin, session, stakeInfo });
    const { status } = await setActiveUser({ session, genesis, stakeInfo });

    UT.LogIn();
    return { username, session, status, stakeInfo };
  } finally {
    // Release the lock
    refreshUserStatusLock = false;
  }
};

export const logOut = async () => {
  // Stop refreshing user status
  refreshUserStatusLock = true;
  try {
    const {
      sessions,
      core: { systemInfo },
    } = store.getState();
    store.dispatch({
      type: TYPE.LOGOUT,
    });
    if (systemInfo?.multiuser) {
      await Promise.all([
        Object.keys(sessions).map((session) => {
          callAPI('sessions/terminate/local', { session });
        }),
      ]);
    } else {
      await callAPI('sessions/terminate/local');
    }
    UT.LogOut();
  } finally {
    // Release the lock
    refreshUserStatusLock = false;
  }
};

export async function setActiveUser({ session, genesis, stakeInfo }) {
  const {
    core: { systemInfo },
  } = store.getState();

  const [status, profileStatus, sessions, newStakeInfo] = await Promise.all([
    callAPI('sessions/status/local', { session }),
    callAPI('profiles/status/master', { session, genesis }),
    systemInfo?.multiuser
      ? callAPI('sessions/list/local')
      : Promise.resolve(null),
    stakeInfo
      ? Promise.resolve(null)
      : callAPI('finance/get/stakeinfo', { session }).catch((err) => {
          if (err.code !== -70) {
            // Only ignore 'Trust account not found' error
            throw err;
          }
        }),
  ]);

  const result = {
    session,
    sessions,
    status,
    stakeInfo: stakeInfo || newStakeInfo || null,
    profileStatus,
  };
  store.dispatch({
    type: TYPE.ACTIVE_USER,
    payload: result,
  });
  return result;
}

async function shouldUnlockStaking(stakeInfo) {
  const {
    settings: { enableStaking, dontAskToStartStaking },
    core: { systemInfo },
    user: { startStakingAsked },
  } = store.getState();

  if (systemInfo?.litemode || systemInfo?.multiuser || !enableStaking) {
    return false;
  }

  if (!stakeInfo?.new) {
    return true;
  }

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
    store.dispatch({
      type: TYPE.ASK_START_STAKING,
    });
    if (checkboxRef.current?.checked) {
      updateSettings({ dontAskToStartStaking: true });
    }
    if (accepted) {
      return true;
    }
  }

  return false;
}

async function unlockUser({ pin, session, stakeInfo }) {
  const unlockStaking = await shouldUnlockStaking(stakeInfo);
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
      session,
    });
  } catch (error) {
    if (error.code && error.code === -139) {
      showBackgroundTask(UserUnLockIndexingBackgroundTask, {
        pin,
        notifications: true,
        staking: unlockStaking,
        mining: !!enableMining,
        session,
      });
    } else throw error;
  }
}

function UserUnLockIndexingBackgroundTask({
  pin,
  notifications,
  staking,
  mining,
  session,
}) {
  const closeTaskRef = useRef();
  useEffect(
    () =>
      observeStore(
        ({ user: { status } }) => status?.indexing,
        async (isIndexing) => {
          if (!isIndexing) {
            try {
              await callAPI('sessions/unlock/local', {
                pin,
                notifications,
                staking,
                mining,
                session,
              });
            } catch (error) {
              showNotification(__('User Failed to Unlock'), 'error');
            }
            closeTaskRef.current?.();
            showNotification(__('User Unlocked'), 'success');
          }
        }
      ),
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

const sessionsAtom = atom(null);
const selectedSessionIdAtom = atom(null);
const userStatusAtom = atom(null);
const profileStatusAtom = atom(null);

const activeSessionIdAtom = atom((get) => {
  const sessions = get(sessionsAtom);
  const selectedSessionId = get(selectedSessionIdAtom);
  if (selectedSessionId) return selectedSessionId;
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

const activeSessionAtom = atom((get) => {
  const sessions = get(sessionsAtom);
  const activeSessionId = get(activeSessionIdAtom);
  return activeSessionId && sessions?.[activeSessionId];
});

const usernameAtom = atom((get) => {
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
