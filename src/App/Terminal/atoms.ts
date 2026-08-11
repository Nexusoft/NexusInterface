import { useEffect } from 'react';
import { atom } from 'jotai';
import { store } from 'lib/store';

export type ConsoleTab = 'Console' | 'Core';

export const lastActiveTabAtom = atom<ConsoleTab>('Console');
export function useConsoleTab(tab: ConsoleTab) {
  useEffect(() => {
    store.set(lastActiveTabAtom, tab);
  }, []);
}
