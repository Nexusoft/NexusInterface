import { useEffect } from 'react';
import { atom } from 'jotai';
import { store } from 'lib/store';

export type UserTab =
  | 'Accounts'
  | 'Names'
  | 'Namespaces'
  | 'Assets'
  | 'Tokens'
  | 'Staking';

export const lastActiveTabAtom = atom<UserTab>('Accounts');
export function useUserTab(tab: UserTab) {
  useEffect(() => {
    store.set(lastActiveTabAtom, tab);
  }, []);
}

export const balancesShowFiatAtom = atom(false);
