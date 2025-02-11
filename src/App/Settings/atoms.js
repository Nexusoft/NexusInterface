import { useEffect } from 'react';
import { atom } from 'jotai';
import { store } from 'lib/store';

export const lastActiveTabAtom = atom('App');
export function useSettingsTab(tab) {
  useEffect(() => {
    store.set(lastActiveTabAtom, tab);
  }, []);
}
