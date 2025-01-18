import { useEffect } from 'react';
import { atom } from 'jotai';
import { jotaiStore } from 'store';

export const lastActiveTabAtom = atom('Accounts');
export function useUserTab(tab) {
  useEffect(() => {
    jotaiStore.set(lastActiveTabAtom, tab);
  }, []);
}

export const balancesShowFiatAtom = atom(false);
