import { useEffect } from 'react';
import { atom } from 'jotai';
import { jotaiStore } from 'store';

export const lastActiveTabAtom = atom('Console');
export function useConsoleTab(tab) {
  useEffect(() => {
    jotaiStore.set(lastActiveTabAtom, tab);
  }, []);
}
