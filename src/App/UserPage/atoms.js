import { useEffect } from 'react';
import { atom } from 'jotai';
import { store } from 'lib/store';

export const lastActiveTabAtom = atom('Accounts');
export function useUserTab(tab) {
  useEffect(() => {
    store.set(lastActiveTabAtom, tab);
  }, []);
}

export const balancesShowFiatAtom = atom(false);
