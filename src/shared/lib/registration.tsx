import { atom } from 'jotai';
import log from 'electron-log';

import LoginModal from 'components/LoginModal';
import { store, subscribe } from 'lib/store';
import { callAPI } from 'lib/api';
import { blocksAtom, isCoreConnected } from 'lib/coreInfo';
import { settingsAtom, updateSettings } from 'lib/settings';
import { loggedInAtom } from 'lib/session';
import { showNotification, openModal, isModalOpen } from 'lib/ui';
import { navigate } from 'lib/wallet';

__ = __context('NewUser');

const checkSeconds = 15;

/** Last time profiles/status/master answered for the pending account */
export const registrationCheckedAtom = atom<number | null>(null);

let checking = false;

async function check() {
  const pending = store.get(settingsAtom).pendingRegistration;
  if (!pending || pending.confirmedAt || checking || !isCoreConnected()) return;
  checking = true;
  try {
    const status = await callAPI('profiles/status/master', {
      username: pending.username,
    });
    store.set(registrationCheckedAtom, Date.now());
    if (!status?.confirmed) return;
    //the user may have stopped waiting meanwhile
    if (
      store.get(settingsAtom).pendingRegistration?.username !== pending.username
    ) {
      return;
    }
    //the screen stays and says it is done until the user logs in or closes it
    updateSettings({
      pendingRegistration: { ...pending, confirmedAt: Date.now() },
    });
    log.info(`Registration - ${pending.username} confirmed`);
    showNotification(
      __(
        'User <b>%{username}</b> has been successfully registered',
        { username: pending.username },
        {
          b: (text) => (
            <span>
              &nbsp;<strong>{text}</strong>&nbsp;
            </span>
          ),
        }
      ),
      'success'
    );
    openRegistrationLogin();
  } catch (err) {
    //not in a block yet: the core does not know the name
  } finally {
    checking = false;
  }
}

/** Login for the new user, its name already filled in */
export function openRegistrationLogin() {
  const pending = store.get(settingsAtom).pendingRegistration;
  if (!store.get(loggedInAtom) && !isModalOpen(LoginModal)) {
    openModal(LoginModal, { username: pending?.username });
  }
}

export function startRegistration(username: string) {
  updateSettings({
    pendingRegistration: { username, startedAt: Date.now() },
  });
  store.set(registrationCheckedAtom, null);
  navigate('/');
}

export function stopWaitingForRegistration() {
  updateSettings({ pendingRegistration: null });
}

export function prepareRegistration() {
  subscribe(loggedInAtom, (loggedIn) => {
    if (loggedIn && store.get(settingsAtom).pendingRegistration?.confirmedAt) {
      updateSettings({ pendingRegistration: null });
    }
  });
  subscribe(blocksAtom, () => {
    check();
  });
  setInterval(check, checkSeconds * 1000);
  check();
}
