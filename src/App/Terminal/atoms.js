import { useEffect } from 'react';
import { atom } from 'jotai';
import { store } from 'lib/store';

export const lastActiveTabAtom = atom('Console');
export function useConsoleTab(tab) {
  useEffect(() => {
    store.set(lastActiveTabAtom, tab);
  }, []);
}
