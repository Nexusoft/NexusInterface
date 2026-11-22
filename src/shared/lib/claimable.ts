import { atom } from 'jotai';

import { store, subscribe } from 'lib/store';
import { modulesAtom } from 'lib/modules';
import { readModuleStorage } from 'lib/modules/storage';
import { loggedInAtom, userGenesisAtom } from 'lib/session';
import { showNotification } from 'lib/ui';
import { showDesktopNotif } from 'utils/misc';
import { navigate } from 'lib/wallet';

__ = __context('Claimable');

//how long the module's saved claim count is trusted (same window as the Overview module notices)
const maxAgeSeconds = 7 * 86400;
const pollMs = 20000;

/** The installed Nexus Contracts module, if present, to send the user to */
export const contractsModuleAtom = atom((get) => {
  const modules = get(modulesAtom);
  return (
    modules.find(
      (m) =>
        m.enabled &&
        m.info?.type === 'app' &&
        /contract/i.test(`${m.info?.name} ${m.info?.displayName || ''}`)
    ) || null
  );
});

//How many contract payments are actually waiting to be claimed. The module is the only thing that knows this: a
//plain send auto-credits and an expired contract can no longer be claimed, so the raw unclaimed balance would
//over-count. The module publishes its own claimable count to its storage while it is open, and this reads that,
//so the number shown on the Overview and the nav badge always matches what the module lists - never more.
export const claimCountAtom = atom(0);

/** Open the contracts module if it is installed, otherwise the Transactions page */
export function openClaimTarget() {
  const module = store.get(contractsModuleAtom);
  navigate(module ? `/Modules/${module.info.name}` : '/Transactions');
}

async function readClaimCount(): Promise<number> {
  const module = store.get(contractsModuleAtom);
  if (!module || !store.get(loggedInAtom)) {
    return 0;
  }
  try {
    const o = (await readModuleStorage(module))?.overview;
    const count = Number(o?.count);
    const fresh =
      typeof o?.at === 'number' && Date.now() / 1000 - o.at < maxAgeSeconds;
    return fresh && Number.isInteger(count) && count > 0 ? count : 0;
  } catch {
    return 0;
  }
}

export function prepareClaimable() {
  let notifiedFor: string | null = null;
  //reset the once-per-login notice when the user changes
  subscribe(userGenesisAtom, () => {
    notifiedFor = null;
  });
  const poll = async () => {
    const count = await readClaimCount();
    if (store.get(claimCountAtom) !== count) {
      store.set(claimCountAtom, count);
    }
    if (count <= 0) {
      return;
    }
    const key = store.get(userGenesisAtom) || 'me';
    if (notifiedFor === key) {
      return;
    }
    notifiedFor = key;
    const text = __('You have payments to claim');
    showDesktopNotif(__('Payments to claim'), text);
    showNotification(text, 'work');
  };
  void poll();
  setInterval(() => void poll(), pollMs);
}
