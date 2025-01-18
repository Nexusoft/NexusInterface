import { useEffect } from 'react';
import { atom } from 'jotai';
import { jotaiStore } from 'store';

export const lastActiveTabAtom = atom('App');
export function useSettingsTab(tab) {
  useEffect(() => {
    jotaiStore.set(lastActiveTabAtom, tab);
  }, []);
}
