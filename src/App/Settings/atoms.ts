import { useEffect } from 'react';
import { atom } from 'jotai';
import { store } from 'lib/store';

export type SettingsTab = 'App' | 'Core' | 'Style' | 'Modules';

export const lastActiveTabAtom = atom<SettingsTab>('App');
export function useSettingsTab(tab: SettingsTab) {
  useEffect(() => {
    store.set(lastActiveTabAtom, tab);
  }, []);
}
