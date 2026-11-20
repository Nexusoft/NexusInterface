import { atom } from 'jotai';

import { store, subscribe } from 'lib/store';
import { callAPI } from 'lib/api';
import { coreConnectedAtom, synchronizedAtom } from 'lib/coreInfo';
import { loggedInAtom, userGenesisAtom } from 'lib/session';
import { modulesAtom } from 'lib/modules';
import { showNotification } from 'lib/ui';
import { showDesktopNotif } from 'utils/misc';
import { navigate } from 'lib/wallet';
import jotaiQuery from 'utils/jotaiQuery';

__ = __context('Claimable');

//one token's balances. The amount received into your accounts but not yet credited is what can be claimed.
//The core API documents this as `pending` (confirmed debits to your accounts, not yet credited), but this core
//does not return that field and reports the same amount under `unclaimed` instead, so read `pending` first and
//fall back to `unclaimed`. Normal sends auto-credit so this clears in a block; contract payments (escrow, code,
//approvals, time-locks, return-if-unclaimed) are not auto-creditable, so they stay until the recipient claims.
interface TokenBalances {
  token: string;
  ticker?: string;
  available?: number;
  pending?: number;
  unclaimed?: number;
}

//prefer `pending` (incoming, per the API doc); fall back to `unclaimed` on a core that reports it there
const claimableOf = (b: TokenBalances) => (b.pending ?? b.unclaimed ?? 0) || 0;

export const balancesQuery = jotaiQuery<TokenBalances[]>({
  alwaysOn: true,
  condition: (get) =>
    get(loggedInAtom) && get(coreConnectedAtom) && get(synchronizedAtom),
  getQueryConfig: (get) => ({
    queryKey: ['balances', get(userGenesisAtom)],
    queryFn: () => callAPI('finance/get/balances'),
    refetchInterval: 45000, // 45 seconds
    refetchOnWindowFocus: 'always',
    placeholderData: (previousData) => previousData,
  }),
});

export interface PendingClaim {
  ticker: string;
  pending: number;
}

/** Tokens with something waiting to be claimed into the user's accounts */
export const pendingClaimsAtom = atom<PendingClaim[]>((get) => {
  const balances = get(balancesQuery.valueAtom);
  if (!Array.isArray(balances)) return [];
  return balances
    .filter((b) => claimableOf(b) > 1e-9)
    .map((b) => ({
      ticker: b.ticker || (b.token === '0' ? 'NXS' : '?'),
      pending: claimableOf(b),
    }));
});

export const hasPendingClaimsAtom = atom(
  (get) => get(pendingClaimsAtom).length > 0
);

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

/** Open the contracts module if it is installed, otherwise the Transactions page */
export function openClaimTarget() {
  const module = store.get(contractsModuleAtom);
  navigate(module ? `/Modules/${module.info.name}` : '/Transactions');
}

function summary(claims: PendingClaim[]) {
  return claims
    .map((c) => `${Number(c.pending.toFixed(6))} ${c.ticker}`)
    .join(', ');
}

export function prepareClaimable() {
  let notifiedFor: string | null = null;
  //reset the once-per-login notice when the user changes
  subscribe(userGenesisAtom, () => {
    notifiedFor = null;
  });
  subscribe(pendingClaimsAtom, (claims) => {
    if (!claims.length) return;
    const key = store.get(userGenesisAtom) || 'me';
    if (notifiedFor === key) return;
    notifiedFor = key;
    const text = __('You have %{summary} waiting to be claimed', {
      summary: summary(claims),
    });
    showDesktopNotif(__('Payments to claim'), text);
    showNotification(text, 'work');
  });
}
